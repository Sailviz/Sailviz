import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findChromecast(clubId: any) {
    var result = await prisma.chromecasts.findMany({
        where: {
            clubId: clubId
        }
    })
    return result;
}


export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId
    var chromecast = await findChromecast(clubId)
    if (chromecast) {
        return NextResponse.json({ error: false, chromecasts: chromecast });
    }
    else {
        return NextResponse.json({ error: true, message: 'Could not find chromecast' });
    }
}
