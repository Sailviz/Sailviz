import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

async function findResult(resultId: any) {
    var result = await prisma.result.findFirst({
        where: {
            id: resultId
        },
    })
    return result;
}

async function deleteResult(resultId: any) {
    var result = await prisma.result.delete({
        where: {
            id: resultId
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.resultId, 'resultId required');

    } catch (bodyError) {
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    var resultId = req.resultId

    let authorised = await isRequestAuthorised(request.cookies, AVAILABLE_PERMISSIONS.editResults, resultId, "result")
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var result = await findResult(resultId)
    if (result) {
        await deleteResult(resultId)
        return NextResponse.json({ res: result }, { status: 200 });
    }
    return NextResponse.json({ error: 'result not found' }, { status: 400 });
}
