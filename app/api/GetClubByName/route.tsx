import { NextRequest, NextResponse } from "next/server";
import prisma from 'components/prisma'
import assert from 'assert';

async function getClub(name: string) {
    var result = await prisma.club.findFirst({
        where: {
            name: name
        }
    })
    if (result == null) {
        return
    }
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.name);
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }
    var name: string = req.name
    console.log(name)
    var club = await getClub(name)
    if (club) {
        return NextResponse.json({ error: false, club: club });
    }
    else {
        return NextResponse.json({ error: true, message: 'Could not find club' });
    }

};
