import prisma from "@/lib/prisma"
import { NextRequest } from "next/server"

const ERROR_CAUSE = "WRONG_INPUTS";

export async function POST(req: NextRequest) {
    try {
        const baseUrl = req.nextUrl.origin;
        let { hostId } = await req.json();

        if (!hostId) {
            throw new Error("No user ID provided", { cause: ERROR_CAUSE });
        }

        if (hostId) {
            hostId = (await prisma.user.findUnique({
                where: {
                    id: hostId,
                },
                select: {
                    id: true,
                }
            }))?.id;
        }

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

        return Response.json({ link: `${baseUrl}/meeting/${meeting.id}` }, { status: 200 });
    } catch (err: Error | any) {
        return Response.json({
            error: ((err?.cause === ERROR_CAUSE) ? err.message : "Failed to create meeting"),
        }, {
            status: 500,
        });
    }
}