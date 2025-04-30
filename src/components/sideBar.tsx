'use client'

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "./ui/button";
import { DataChannelMessage, WebRTCService } from "@/lib/webrtc-service";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { memo, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, MessageSquare, Mic, MicOff, MoreHorizontal, Send, Users, Video, VideoOff, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import useParticipantStore from "@/store/participant";
import useSidebarOpenStore from "@/store/sideBar";

const SideBar = memo(({ service }: { service: WebRTCService }) => {
    const chatEndRef = useRef<HTMLDivElement>(null)
    const messageRef = useRef<HTMLInputElement>(null)
    const [messages, setMessages] = useState<DataChannelMessage[]>([])
    const participants = useParticipantStore((state) => state.participants)
    const { sidebarOpen, activeTab, setSidebarOpen, setActiveTab } = useSidebarOpenStore()

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        service.onDataChannelMessage((message: DataChannelMessage) => {
            setMessages((prevMessages) => [...prevMessages, message])
        });
    }, [service])

    // Send a chat message
    const SendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        const message = messageRef.current?.value || ""
        if (message.trim() && service) {
            const newMessage: DataChannelMessage = {
                sender: service.userName!,
                senderId: service.userId!,
                content: message,
                timestamp: Date.now(),
            }
            setMessages((prevMessages) => [...prevMessages, newMessage])
            service.sendDataMessage(newMessage)
            messageRef.current!.value = ""
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
                            People ({participants.length})
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
                                <div key={idx} className={`flex flex-col ${msg.senderId === service.userId ? "bg-primary/15" : "bg-gray-100 dark:bg-neutral-800"} rounded-lg py-3 px-4`}>
                                    <div className="flex items-center mb-1">
                                        <span className={cn("font-medium mr-2", msg.senderId === service.userId && "text-blue-500 dark:text-blue-400")}>
                                            {msg.sender}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                    <p className={cn("text-foreground", msg.senderId === service.userId && "text-muted-foreground italic")}>
                                        {msg.content}
                                    </p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </ScrollArea>
                    <form onSubmit={SendMessage} className="p-4 border-t border-border flex items-center">
                        <Input
                            type="text"
                            placeholder="Send a message to everyone"
                            ref={messageRef}
                            className="flex-1 mr-2 focus-visible:ring-primary focus-visible:border-primary border-primary/50"
                        />
                        <Button type="submit" size="icon" variant="ghost">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    )
})

SideBar.displayName = "SideBar"
export default SideBar