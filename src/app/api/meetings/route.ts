import { NEXT_AUTH } from "@/lib/auth";
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server"

const ERROR_CAUSE = "WRONG_INPUTS";

export async function POST(req: NextRequest) {
    const session = await getServerSession(NEXT_AUTH)

    try {
        if (!session?.user) {
            throw new Error("No user ID provided", { cause: ERROR_CAUSE });
        }

        const hostId = (await prisma.user.findUnique({
            where: {
                email: session.user.email!,
            },
            select: {
                id: true,
            }
        }))?.id;

        if (!hostId) {
            throw new Error("Invalid user ID provided", { cause: ERROR_CAUSE });
        }

        const meeting = await prisma.meeting.create({
            data: {
                hostId,
            },
            select: {
                id: true,
            }
        });

        const baseUrl = req.nextUrl.origin;

        return Response.json({ link: `${baseUrl}/meeting/${meeting.id}` }, { status: 200 });

    } catch (err) {

        return Response.json({
            error: (err instanceof Error ? (err.cause === ERROR_CAUSE) && err.message : "Failed to create meeting"),
        }, {
            status: 500,
        });
    }
}