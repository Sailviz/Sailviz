import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findClub(clubId: string) {
    var result = await prisma.club.findUnique({
        where: {
            id: clubId,
        },
    })
    return result;
}

async function createRole(clubId: string) {
    var user = await prisma.role.create({
        data: {
            clubId: clubId,
            name: "",
            permissions: {},
        },
    })
    return user;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId, 'club required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }
    var clubId = req.clubId

    //check club exists
    var club = await findClub(clubId)
    if (club == null) {
        return NextResponse.json({ error: true, message: 'Club does not exist' });
    }

    var role = createRole(club.id)
    if (role) {
        return NextResponse.json({ error: false, role: role });
    }
    else {
        return NextResponse.json({ error: true, message: 'Something went wrong crating role account' });
    }

};
