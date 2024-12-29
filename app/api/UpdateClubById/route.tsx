import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';
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
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    let authorised = await isRequestAuthorised(request.cookies.get("token")!.value, AVAILABLE_PERMISSIONS.editHardware)
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var club: ClubDataType = req.club

    var updatedClub = await updateClub(club)
    if (updatedClub) {
        return NextResponse.json({ res: updatedClub }, { status: 200 });
    }
    return NextResponse.json({ error: 'club not found' }, { status: 400 });
}
