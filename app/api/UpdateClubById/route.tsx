import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

//this only updates the settings part of the club record

async function updateClub(club: ClubDataType) {
    var result = await prisma.club.update({
        where: {
            id: club.id
        },
        data: {
            settings: club.settings
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.club);
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var club: ClubDataType = req.club


    var updatedBoat = await updateClub(club)
    if (updatedBoat) {
        return NextResponse.json({ error: false, club: updatedBoat });
    } else {
        // club is not there
        return NextResponse.json({ error: true, message: 'club not found' });
    }
}
