import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

async function findBoat(boat: string) {
    var result = await prisma.boat.findFirst({
        where: {
            id: boat
        },
    })
    return result;
}

async function deleteBoat(boat: string) {
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
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    var boatId = req.id

    let authorised = await isRequestAuthorised(request.cookies, AVAILABLE_PERMISSIONS.editBoats, boatId, "boat")
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var boat = await findBoat(boatId)
    if (boat) {
        await deleteBoat(boatId)
        return NextResponse.json({ res: boat }, { status: 200 });
    } else {
        // User exists
        return NextResponse.json({ error: 'boat not found' }, { status: 400 });
    }
}
