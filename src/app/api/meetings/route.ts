import prisma from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    const baseUrl = req.nextUrl.origin;
    let userId: string | undefined = undefined;
    try {
        const { id } = await req.json();
        userId = id;
    } catch (err) {
        console.log("No user ID provided, creating open meeting", err);
    }
    try {
        if (userId) {
            userId = (await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                }
            }))?.id;
        }
        const meeting = await prisma.meeting.create({
            data: {
                hostId: userId,
            },
            select: {
                id: true,
            }
        });
        return Response.json({ link: `${baseUrl}/meeting/${meeting.id}` }, { status: 200 });
    } catch (err) {
        console.error("Error creating meeting:", err);
    }

    return Response.json({ error: "Failed to create meeting" }, { status: 500 });
}