import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

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
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    let authorised = await isRequestAuthorised(request.cookies.get("token")!.value, AVAILABLE_PERMISSIONS.editBoats)
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var boat: BoatDataType = req.boat

    var updatedBoat = await updateBoat(boat)
    if (updatedBoat) {
        return NextResponse.json({ res: updatedBoat }, { status: 200 });
    }
    return NextResponse.json({ error: 'boat not found' }, { status: 400 });
}
