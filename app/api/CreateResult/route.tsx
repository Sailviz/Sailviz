import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';

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
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var fleetId = req.fleetId

    var fleet = await findFleet(fleetId)
    if (!fleet) {
        return NextResponse.json({ error: true, message: 'Could not find fleet' });
    }
    var result = await createEntry(fleetId)
    return NextResponse.json({ error: false, result: result });
}
