'use client'

import { cn } from "@/lib/utils"
import { memo, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useMobile } from "@/hooks/use-mobile"
import { LucideChevronLeft, LucideChevronRight } from "lucide-react"
import { Participant } from "./participant"
import useParticipantStore from "@/store/participant"

const VideoGrid = memo(({ participantsLength }: { participantsLength: number }) => {
    const mobile = useMobile();
    const [currentPage, setCurrentPage] = useState(0)
    console.log("Rendering video grid", participantsLength)

    const participantsPerPage = mobile ? 6 : 9
    const totalPages = participantsLength / participantsPerPage

    const currentParticipants = useMemo(() => {
        console.log("Calculating current participants")
        const start = currentPage * participantsPerPage
        const end = start + participantsPerPage

        return useParticipantStore.getState().participants.slice(start, end)
    }, [participantsLength, currentPage, participantsPerPage]);

    // Remove a participant from the meeting
    const removeParticipant = useCallback((participantId: number) => {
        toast.success("Participant removed", {
            description: `Participant has been removed from the meeting`,
            duration: 2000,
        })
    }, []);


    const getGridClass = useMemo(() => {
        switch (currentParticipants.length) {
            case 1:
                return "grid-cols-1"
            case 2:
                return "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1"
            case 3:
                return "grid-cols-2 grid-rows-2"
            case 4:
                return "grid-cols-2 grid-rows-2"
            case 5:
            case 6:
                return "grid-cols-2 grid-rows-3 md:grid-cols-3 md:grid-rows-2"
            default:
                return "grid-cols-2 md:grid-cols-3 grid-rows-3"
        }
    }, [currentParticipants.length])


    return (
        <main className="flex-1 flex flex-grow overflow-hidden">
            <div className={cn("h-full w-full p-2 grid gap-2", getGridClass)}>
                {currentParticipants.map(
                    (participant) =>
                        <Participant
                            key={participant.id}
                            participant={participant}
                            onRemove={() => removeParticipant(participant.id)}
                        />
                )}
            </div>

            {totalPages > 1 && (
                <div className="absolute bottom-20 left-0 w-full flex justify-center items-center space-x-2">
                    <Button
                        size="icon"
                        className="rounded-full bg-primary text-white"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 0}
                    >
                        <LucideChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <div
                                key={index}
                                className={cn("h-2 w-2 rounded-full shadow border", currentPage === index ? "bg-primary" : "bg-gray-400")}
                            />
                        ))}
                    </div>

                    <Button
                        size="icon"
                        className="rounded-full bg-primary text-white"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages - 1}
                    >
                        <LucideChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </main>
    )
});

export default VideoGrid