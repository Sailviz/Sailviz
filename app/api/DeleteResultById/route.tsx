import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

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

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.resultId, 'resultId required');

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }
    console.log(req.body)

    var resultId = req.resultId

    var result = await findResult(resultId)
    if (result) {
        await deleteResult(resultId)
        return Response.json({ error: false, result: result });
    } else {
        // User exists
        return Response.json({ error: true, message: 'result not found' });
    }
}
