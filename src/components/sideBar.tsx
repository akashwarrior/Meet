import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LogOut, MessageSquare, Mic, MicOff, MoreHorizontal, Send, Users, Video, VideoOff, X } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import useParticipantStore, { useSidebarOpenStore, useWebRTCStore } from "@/store/participant";
import { DataChannelMessage } from "@/lib/webrtc-service";

export default function SideBar() {
    // Refs
    const chatEndRef = useRef<HTMLDivElement>(null)

    // UI States
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<DataChannelMessage[]>([])

    const participants = useParticipantStore((state) => state.participants)
    const service = useWebRTCStore((state) => state.webRTCService)
    const { sidebarOpen, activeTab, setSidebarOpen, setActiveTab } = useSidebarOpenStore()

    // Scroll chat to bottom when new messages arrive
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        if (!service) return
        service.onDataChannelMessage((message: DataChannelMessage) => {
            setMessages((prevMessages) => [...prevMessages, message])
        });
    }, [service])

    // Send a chat message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (message.trim() && service) {
            const newMessage: DataChannelMessage = {
                sender: "You",
                content: message,
                timestamp: Date.now(),
                connectToServer: false,
            }
            setMessages((prevMessages) => [...prevMessages, newMessage])
            service.sendDataMessage(newMessage)
            setMessage("")
        }
    }

    return (
        <div className={cn("bg-background overflow-hidden border max-w-fulwl w-sm flex flex-col transition-all duration-300 rounded-lg",
            sidebarOpen ? "translate-x-0" : "translate-x-full w-0",
        )}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <TabsList className="w-full">
                        <TabsTrigger value="participants" className="flex-1">
                            <Users className="h-4 w-4 mr-2" />
                            People ({participants.length + 1})
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                        </TabsTrigger>
                    </TabsList>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <TabsContent value="participants" className="flex-1 p-0 m-0 overflow-hidden">
                    <h3 className="text-sm font-medium text-muted-foreground my-2 mx-4">Participants</h3>
                    <ScrollArea className="h-full px-6">
                        {participants.map((participant) => (
                            <div key={participant.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-green-500">{participant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{participant.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center text-muted-foreground gap-4">
                                        {participant.name ? <MicOff size="18" /> : <Mic size="18" />}
                                        {participant.name ? <VideoOff size="18" /> : <Video size="18" />}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreHorizontal size="6" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                {participant.name ? "Unmute" : "Mute"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                // onClick={() => removeParticipant(participant.id)}
                                                className="text-red-500"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <div className="flex items-center mb-1">
                                        <span className={cn("font-medium mr-2", msg.connectToServer && "text-blue-500 dark:text-blue-400")}>
                                            {msg.sender}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className={cn("text-foreground", msg.connectToServer && "text-muted-foreground italic")}>
                                        {msg.content}
                                    </p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex items-center">
                        <Input
                            type="text"
                            placeholder="Send a message to everyone"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 mr-2"
                        />
                        <Button type="submit" size="icon" variant="ghost">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    )
}