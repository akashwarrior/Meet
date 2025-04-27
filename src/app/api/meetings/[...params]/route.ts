import prisma from "@/lib/prisma"
import { NextRequest } from "next/server"

// validating meeting ID
export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.pathname.split("/")?.pop();
        if (!id) {
            return Response.json({ error: "Meeting ID is required" }, { status: 400 })
        }
        const res = await prisma.meeting.findUnique({
            where: {
                id,
            }
        })

        if (!res) {
            return Response.json({ error: "Meeting not found" }, { status: 404 })
        }
        return Response.json({ message: "Joining meeting..." }, { status: 200 })

    } catch (error) {
        console.error("Error fetching meeting:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 })
    }
}