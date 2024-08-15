import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

async function getLaps() {
    var result = await prisma.lap.findMany({
        where: {
            time: {
                gte: 0
            }
        },
    })
    if (result == null) {
        return
    }
    return result;
}

export async function GET(request: NextRequest) {

    var laps = await getLaps()
    if (laps) {
        return NextResponse.json(laps);
    }
    else {
        return NextResponse.json({ error: "can't find user" }, { status: 406 });
    }
};