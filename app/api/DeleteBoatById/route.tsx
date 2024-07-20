import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findBoat(boat: string) {
    var result = await prisma.boat.findFirst({
        where: {
            id: boat
        },
    })
    return result;
}

async function deleteRace(boat: string) {
    var result = await prisma.boat.delete({
        where: {
            id: boat
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id);

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var boatId = req.id

    var boat = await findBoat(boatId)
    if (boat) {
        await deleteRace(boatId)
        return NextResponse.json({ error: false, boat: boat });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'boat not found' });
    }
}
