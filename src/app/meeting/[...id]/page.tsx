import Meeting from "@/components/page/Meeting"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function MeetingRoom({ params }: { params: Promise<{ id: string }> }) {
  const meetingId = (await params).id[0]
  const session = await getServerSession()

  if (!meetingId) {
    console.log("No meeting ID found, redirecting to homepage")
    redirect("/");
  }

  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId
    },
    select: {
      id: true,
      host: {
        select: {
          email: true,
        }
      }
    }
  })

  if (!meeting) {
    redirect("/")
  }

  return (
    <Meeting
      meetingId={meetingId}
      name={session?.user?.name}
      isHost={meeting.host.email === session?.user?.email}
    />
  )
}