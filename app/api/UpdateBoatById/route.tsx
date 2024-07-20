import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function updateBoat(boat: BoatDataType) {
    var result = await prisma.boat.update({
        where: {
            id: boat.id
        },
        data: boat
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.boat);

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var boat: BoatDataType = req.boat

    var updatedBoat = await updateBoat(boat)
    if (updatedBoat) {
        return NextResponse.json({ error: false, boat: updatedBoat });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'boat not found' });
    }
}
