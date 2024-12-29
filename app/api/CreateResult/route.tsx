import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

async function findFleet(fleetId: string) {
    var result = await prisma.fleet.findUnique({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function createEntry(fleetId: string) {
    var res = await prisma.result.create({
        data: {
            Helm: "",
            Crew: "",
            SailNumber: "",
            finishTime: 0,
            CorrectedTime: 0,
            PursuitPosition: 0,
            HandicapPosition: 0,
            isDeleted: false,
            fleet: {
                connect: {
                    id: fleetId
                }
            },
            boat: {},
            laps: {},
            numberLaps: 0,
            resultCode: "",
        },
        include: {
            laps: true,
        }
    })
    return res;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.fleetId, 'Id required');

    } catch (bodyError) {
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    let authorised = await isRequestAuthorised(request.cookies.get("token")!.value, AVAILABLE_PERMISSIONS.editResults)
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var fleetId = req.fleetId

    var fleet = await findFleet(fleetId)
    if (fleet) {
        var result = await createEntry(fleetId)
        return NextResponse.json({ res: result }, { status: 200 });
    }
    return NextResponse.json({ error: 'Could not find fleet' }, { status: 400 });
}
