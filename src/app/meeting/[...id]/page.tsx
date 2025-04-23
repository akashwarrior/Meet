import Meeting from "@/components/page/Meeting"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function MeetingRoom({ params }: { params: Promise<{ id: string }> }) {
  const meetingId = (await params).id[0]

  if (!meetingId) {
    console.log("No meeting ID found, redirecting to homepage")
    redirect("/");
  }

  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId
    },
    select: {
      id: true
    }
  })

  if (!meeting) {
    console.log("Icon SVG detected, redirecting to homepage")
    redirect("/")
  }

  return (
    <Meeting meetingId={meeting.id} />
  )
}