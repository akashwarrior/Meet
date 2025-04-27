enum WebRTCEvents {
    OFFER,
    ANSWER,
    ICE_CANDIDATE,
    USER_JOINED,
    USER_LEFT,
}

interface Message {
    type: WebRTCEvents;
    sender?: number;
    receiver: number;
    name?: string;
    data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface DataChannelMessage {
    sender: string,
    content: string,
    timestamp: number,
    connectToServer: boolean
}

declare global {
    interface RTCPeerConnection {
        id: number;
    }
}

export class WebRTCService {
    private readonly configuration: RTCConfiguration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceCandidatePoolSize: 0,
    };

    // Network options
    private readonly NETWORK_PRIORITY: RTCPriorityType = "high"
    private readonly MEDIA_TRACK_PRIORITY: RTCPriorityType = "high"

    // Video options
    private readonly DEFAULT_VIDEO_CODEC: string = "video/H264"
    private readonly MAX_VIDEO_BITRATE: number = 6_000_000  // 6 Mbps
    private readonly VIDEO_RESOLUTION: { width: { ideal: number, max: number }, height: { ideal: number, max: number } } = {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
    };
    private readonly VIDEO_FRAMES: { ideal: number, max: number } = {
        ideal: 24,
        max: 30,
    };

    // Audio options
    private readonly DEFAULT_AUDIO_CODEC: string = "audio/opus"
    private readonly MAX_AUDIO_BITRATE: number = 64_000 // 64 kbps
    private readonly COMPRESSION_CONFIG = {
        threshold: 0,
        knee: 40,
        ratio: 4,
        attack: 0.3,
        release: 0.25,
    }

    // 
    private peerConnection: RTCPeerConnection[];
    private socket: WebSocket | null;
    private stream: MediaStream | null;
    private dataChannel: RTCDataChannel | null;

    // Callbacks
    private onMediaTrackCallback: ((track: { id: number, track: MediaStreamTrack | null }, kind: string) => void) | null = null
    private onParticipantJoinCallback: (({ id, name }: { id: number, name: string }) => void) | null = null
    private onParticipantLeaveCallback: ((id: number) => void) | null = null
    private onDataChannelMessageCallback: ((message: DataChannelMessage) => void) | null = null


    // Private constructor to prevent instantiation
    private constructor() {
        this.peerConnection = []
        this.socket = null
        this.stream = null
        this.dataChannel = null
    }


    // Singleton instance
    private static instance: WebRTCService | null = null
    public static async getInstance(roomId: string): Promise<WebRTCService> {
        if (!this.instance) {
            this.instance = new WebRTCService();
        }
        try {
            const serverUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "ws://localhost:8080"
            this.instance.socket = new WebSocket(`${serverUrl}?roomId=${roomId}`)
            await this.instance.connect();
            this.instance.peerConnection = [];
            this.instance.stream = new MediaStream();
        } catch (error) {
            console.log("Error connecting to signaling server:", error);
            this.instance?.close();
            this.instance = null
            throw new Error("Failed to connect to server")
        }
        return this.instance;
    }


    // WebSocket ---
    private connect(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("WebSocket is not initialized"))
                return
            }
            this.socket.onopen = () => {
                resolve("Connected to signaling server")
            }

            this.socket.onmessage = this.handleSignalingMessage.bind(this)

            this.socket.onerror = (error) => {
                reject(error)
            }

            this.socket.onclose = () => {
                console.log("WebSocket connection closed")
            }
        })
    }

    private sendMessage(message: Message): void {
        if (!this.socket) {
            console.error("WebSocket is not initialized")
            return
        }
        this.socket.send(JSON.stringify(message))
    }

    // Media stream ---
    public async sendVideoStream(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: this.VIDEO_RESOLUTION.width,
                height: this.VIDEO_RESOLUTION.height,
                frameRate: this.VIDEO_FRAMES,
            },
            audio: false,
        });

        const videoTrack = stream.getVideoTracks()[0];
        this.stream?.addTrack(videoTrack);
        this.onMediaTrackCallback?.({ id: -1, track: videoTrack }, "video");

        for (const pc of this.peerConnection) {
            const transceiver = pc.getTransceivers()[1];
            await transceiver.sender.replaceTrack(videoTrack);
            transceiver.direction = 'sendrecv';
        }
    }

    public async sendAudioStream(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
        });

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.5;

        const highPassFilter = audioContext.createBiquadFilter();
        highPassFilter.type = "highpass";
        highPassFilter.frequency.value = 100;

        const lowPassFilter = audioContext.createBiquadFilter();
        lowPassFilter.type = "lowpass";
        lowPassFilter.frequency.value = 9000;

        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(this.COMPRESSION_CONFIG.threshold, audioContext.currentTime);
        compressor.knee.setValueAtTime(this.COMPRESSION_CONFIG.knee, audioContext.currentTime);
        compressor.ratio.setValueAtTime(this.COMPRESSION_CONFIG.ratio, audioContext.currentTime);
        compressor.attack.setValueAtTime(this.COMPRESSION_CONFIG.attack, audioContext.currentTime);
        compressor.release.setValueAtTime(this.COMPRESSION_CONFIG.release, audioContext.currentTime);

        source
            .connect(highPassFilter)
            .connect(lowPassFilter)
            .connect(compressor)
            .connect(gainNode)

        const destination = audioContext.createMediaStreamDestination();
        gainNode.connect(destination);

        const processedStream = destination.stream;
        const audioTrack = processedStream.getAudioTracks()[0];

        for (const pc of this.peerConnection) {
            const transceiver = pc.getTransceivers()[0];
            await transceiver.sender.replaceTrack(audioTrack);
            transceiver.direction = 'sendrecv';
        }

        this.stream?.addTrack(audioTrack);
    }

    public async stopVideoStream(): Promise<void> {
        const videoTrack = this.stream?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.stop();
            this.stream?.removeTrack(videoTrack);
            for (const pc of this.peerConnection) {
                const transceiver = pc.getTransceivers()[1];
                await transceiver.sender.replaceTrack(null);
                transceiver.direction = 'recvonly';
            }
            this.onMediaTrackCallback?.({ id: -1, track: null }, "video");
        }
    }

    public async stopAudioStream(): Promise<void> {
        const audioTrack = this.stream?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.stop();
            this.stream?.removeTrack(audioTrack);
            for (const pc of this.peerConnection) {
                const transceiver = pc.getTransceivers()[0];
                await transceiver.sender.replaceTrack(null);
                transceiver.direction = 'recvonly';
            }
            this.onMediaTrackCallback?.({ id: -1, track: null }, "audio");
        }
    }


    private async setupPeerConnectionListeners({ sender, name }: { sender: number, name: string }): Promise<RTCPeerConnection> {
        const existingPC = this.peerConnection.find(pc => pc.id === sender);
        if (existingPC) {
            return existingPC;
        }

        const pc = new RTCPeerConnection(this.configuration);
        pc.id = sender;
        this.peerConnection.push(pc);
        this.onParticipantJoinCallback?.({ id: sender, name });

        pc.ontrack = ({ track }) => {
            track.onended = () => {
                console.log("Track ended")
                this.onMediaTrackCallback?.({ id: sender, track: null }, track.kind);
            }
            track.onmute = () => {
                console.log("Track muted")
                this.onMediaTrackCallback?.({ id: sender, track: null }, track.kind);
            }
            track.onunmute = () => {
                console.log("Track unmuted")
                this.onMediaTrackCallback?.({ id: sender, track }, track.kind);
            }

            console.log("Received track")
            this.onMediaTrackCallback?.({ id: sender, track }, track.kind);
        };

        pc.onnegotiationneeded = () => {
            console.log("Negotiation needed")
            if (pc.iceGatheringState !== "complete") return
            console.log("Negotiating with the ", pc.id)
            this.createOffer(pc, sender);
        }

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                console.log("Sending ICE candidate")
                this.sendMessage({
                    type: WebRTCEvents.ICE_CANDIDATE,
                    receiver: sender,
                    data: candidate,
                })
            }
        }

        // Handle disconnection
        pc.onconnectionstatechange = () => {
            if (
                pc.connectionState === "disconnected" ||
                pc.connectionState === "failed" ||
                pc.connectionState === "closed"
            ) {
                console.log("Peer connection disconnected or failed");
                this.connectionCleanup(pc);
            }

            if (pc.connectionState === "connected") {
                console.log("Peer connection established")
            }
        }

        return pc;
    }

    private handleSignalingMessage(event: MessageEvent): void {
        const { type, sender, data, name } = JSON.parse(event.data) as Message;

        switch (type) {
            case WebRTCEvents.USER_JOINED:
                this.setupPeerConnectionListeners({ sender: sender!, name: name! })
                    .then((pc) => this.createOffer(pc, sender!));
                break

            case WebRTCEvents.OFFER:
                this.handleOffer({ name, sender, data });
                break

            case WebRTCEvents.ANSWER:
                this.handleAnswer({ sender, data });
                break

            case WebRTCEvents.ICE_CANDIDATE:
                this.handleICECandidate({ sender, data });
                break

            case WebRTCEvents.USER_LEFT:
                const pcToRemove = this.peerConnection.find(pc => pc.id === sender);
                this.connectionCleanup(pcToRemove!);
                break;

            default:
                console.log("Unknown message type:", type)
        }
    }


    // Peer connection setup
    private async createOffer(pc: RTCPeerConnection, sender: number): Promise<void> {
        try {
            await this.setupTransceiver(pc)
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            this.sendMessage({
                type: WebRTCEvents.OFFER,
                receiver: sender!,
                data: offer,
            })
        } catch (error) {
            console.error("Error creating offer:", error)
        }
    }

    private async handleOffer({ name, sender, data }: Partial<Message>): Promise<void> {
        try {
            const pc = await this.setupPeerConnectionListeners({ sender: sender!, name: name! })
            await pc.setRemoteDescription(data as RTCSessionDescriptionInit)
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            this.sendMessage({
                type: WebRTCEvents.ANSWER,
                receiver: sender!,
                data: answer,
            })
        } catch (error) {
            console.error("Error handling offer", error)
        }
    }

    private async handleAnswer({ sender, data }: Partial<Message>): Promise<void> {
        try {
            const pc = this.peerConnection.find(pc => pc.id === sender);
            if (!pc) {
                console.log("Peer connection not found")
                return
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit))
        } catch (error) {
            console.error("Error handling answer:", error)
        }
    }

    private async handleICECandidate({ data, sender }: Partial<Message>): Promise<void> {
        try {
            const pc = this.peerConnection.find(pc => pc.id === sender);
            if (!pc) {
                console.log("Peer connection not found")
                return
            }
            await pc.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit))
        } catch (error) {
            console.error("Error handling ICE candidate:", error);
        }
    }


    // Data channel
    private createDataChannel(pc: RTCPeerConnection): void {
        try {
            this.dataChannel = pc.createDataChannel("data")
            this.setupDataChannel()
        } catch (error) {
            console.error("Error creating data channel:", error)
        }
    }

    public sendDataMessage(message: DataChannelMessage): void {
        if (this.dataChannel && this.dataChannel.readyState === "open") {
            this.dataChannel.send(JSON.stringify(message))
        } else {
            console.error("No open data channel or WebSocket connection")
        }
    }

    private setupDataChannel(): void {
        if (!this.dataChannel) return

        this.dataChannel.onopen = () => {
            console.log("Data channel opened")
        }

        this.dataChannel.onclose = () => {
            console.log("Data channel closed")
        }

        this.dataChannel.onmessage = ({ data }: MessageEvent<any>) => {
            try {
                const message: DataChannelMessage = JSON.parse(data)
                if (!message.connectToServer) {
                    this.onDataChannelMessageCallback?.(message)
                }
            } catch (error) {
                console.error("Error parsing data channel message:", error)
            }
        }
    }


    // Listeners
    public onParticipantJoined(callback: ({ id, name }: { id: number, name: string }) => void): void {
        this.onParticipantJoinCallback = callback;
        callback({ id: -1, name: "You" })
    }

    public onParticipantLeave(callback: (id: number) => void): void {
        this.onParticipantLeaveCallback = callback
    }

    public onMediaTrack(callback: (track: { id: number, track: MediaStreamTrack | null }, kind: string) => void): void {
        this.onMediaTrackCallback = callback;
    }

    public onDataChannelMessage(callback: (message: DataChannelMessage) => void): void {
        this.onDataChannelMessageCallback = callback
    }

    private async setupTransceiver(pc: RTCPeerConnection): Promise<void> {
        if (pc.getTransceivers().length == 2) return;
        const isAudioEnabled = this.stream!.getAudioTracks().length > 0;
        const isVideoEnabled = this.stream!.getVideoTracks().length > 0;

        const audioTransceiver = pc.addTransceiver('audio', {
            direction: isAudioEnabled ? 'sendrecv' : 'recvonly'
        });

        const videoTransceiver = pc.addTransceiver('video', {
            direction: isVideoEnabled ? 'sendrecv' : 'recvonly',
            sendEncodings: isVideoEnabled ? [
                { rid: 'low', scaleResolutionDownBy: 2.0 },
                { rid: 'medium', scaleResolutionDownBy: 1.5 },
                { rid: 'high', scaleResolutionDownBy: 1.0 },
            ] : undefined,
        });

        const videoParams = videoTransceiver.sender.getParameters();
        videoParams.encodings = [{
            maxBitrate: this.MAX_VIDEO_BITRATE,
            maxFramerate: this.VIDEO_FRAMES.max,
            networkPriority: this.NETWORK_PRIORITY,
            priority: this.MEDIA_TRACK_PRIORITY,
        }];

        const audioParams = audioTransceiver.sender.getParameters();
        audioParams.encodings = [{
            maxBitrate: this.MAX_AUDIO_BITRATE,
            networkPriority: this.NETWORK_PRIORITY,
            priority: this.MEDIA_TRACK_PRIORITY,
        }];

        const audioCapabilities = RTCRtpSender.getCapabilities('audio');
        const audioCodec = audioCapabilities?.codecs.find(codec => codec.mimeType === this.DEFAULT_AUDIO_CODEC)
            || audioCapabilities?.codecs[0];

        if (audioCodec) {
            audioTransceiver.setCodecPreferences([audioCodec]);
        }

        const videoCapabilities = RTCRtpSender.getCapabilities('video');
        const videoCodec = videoCapabilities?.codecs.find(codec => codec.mimeType === this.DEFAULT_VIDEO_CODEC)
            || videoCapabilities?.codecs.find(codec => codec.mimeType === 'video/VP9')
            || videoCapabilities?.codecs.find(codec => codec.mimeType === 'video/VP8')
            || videoCapabilities?.codecs[0];


        if (videoCodec) {
            videoTransceiver.setCodecPreferences([videoCodec]);
        }
        
        
        if (isAudioEnabled) {
            await audioTransceiver.sender.setParameters(audioParams);
            audioTransceiver.sender.replaceTrack(this.stream!.getAudioTracks()[0]);
        }
        
        if (isVideoEnabled) {
            await videoTransceiver.sender.setParameters(videoParams);
            videoTransceiver.sender.replaceTrack(this.stream!.getVideoTracks()[0]);
        }
    }


    // Clean up functions
    private connectionCleanup(pc: RTCPeerConnection): void {
        pc.getTransceivers().forEach(transceiver => {
            transceiver.sender?.track?.stop();
            transceiver.receiver?.track?.stop();
            transceiver.stop();
        });
        pc.close();
        this.onParticipantLeaveCallback?.(pc.id)
        this.peerConnection = this.peerConnection.filter(p => p.id !== pc.id);
    }

    public close(): void {
        console.log("Closing WebRTC connection")
        this.peerConnection.forEach((pc) => {
            this.connectionCleanup(pc);
        })
        this.peerConnection = [];

        this.stream?.getTracks().forEach((track) => {
            track.stop();
            this.stream?.removeTrack(track);
        });
        this.stream = null

        if (this.socket) {
            this.socket.onopen = null
            this.socket.onmessage = null
            this.socket.onclose = null
            this.socket.onerror = null
        }
        this.socket?.close()
        this.socket = null

        this.dataChannel?.close()
        this.dataChannel = null

        this.onMediaTrackCallback = null
        this.onParticipantJoinCallback = null
        this.onParticipantLeaveCallback = null
        this.onDataChannelMessageCallback = null
    }
}