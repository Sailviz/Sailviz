import { type NextRequest, NextResponse } from "next/server";
import prisma from 'components/prisma'
import {cookies} from "next/headers";

export async function GET(req: NextRequest) {
    const cookieStore = cookies()
    const clubId = cookieStore.get('clubId')

    if (!clubId) {
        return NextResponse.json(
            { message: "Missing Club ID" },
            { status: 400 });
    }

    const trackers = await prisma.trackers.findMany({
        where: {
            clubId: clubId.value
        }
    })


    return NextResponse.json(
        { trackers: trackers },
        { status: 200 }
    );

}

