import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

async function updateResult(result: ResultsDataType) {
    var res = await prisma.result.update({
        where: {
            id: result.id
        },
        data: {
            SailNumber: result.SailNumber,
            CorrectedTime: result.CorrectedTime,
            Crew: result.Crew,
            Helm: result.Helm,
            finishTime: result.finishTime,
            resultCode: result.resultCode,
            PursuitPosition: result.PursuitPosition,
            HandicapPosition: result.HandicapPosition,
            fleetId: result.fleetId,
            numberLaps: result.numberLaps,
        }
    })
    return res;
}

async function updateBoat(result: ResultsDataType) {
    var res = await prisma.result.update({
        where: {
            id: result.id
        },
        data: {
            boat: {
                connect: {
                    id: result.boat.id
                }
            }
        },
        include: {
            boat: true
        }
    })
    return res;
}


export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.result);

    } catch (bodyError) {
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    var result = req.result

    let authorised = await isRequestAuthorised(request.cookies, AVAILABLE_PERMISSIONS.editResults, result.id, "result")
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    if (result.boat != null) {
        await updateBoat(result)
    }
    var race = await updateResult(result)
    if (race) {
        return NextResponse.json({ res: race }, { status: 200 });
    }
    return NextResponse.json({ error: 'result not found' }, { status: 400 });
}
