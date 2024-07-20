import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findBoats(boatId: any) {
    var result = await prisma.boat.findMany({
        where: {
            clubId: boatId
        }
    })
    return result;
}



export async function POST(request: NextRequest) {
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (e) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId
    var boat = await findBoats(clubId)
    if (boat) {
        return NextResponse.json({ error: false, boats: boat });
    }
    else {
        return NextResponse.json({ error: "can't find boat" }, { status: 406 });
    }

};