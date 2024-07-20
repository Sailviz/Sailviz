import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findResult(id: any) {
    var result = await prisma.result.findFirst({
        where: {
            id: id
        },
        include: {
            boat: true,
            laps: {
                where: {
                    isDeleted: false
                },
                orderBy: {
                    time: 'asc'
                }
            }
        }
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id);

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var id = req.id

    var result = await findResult(id)
    if (result) {
        return Response.json({ error: false, result: result });
    } else {
        // User exists
        return Response.json({ error: true, message: 'result not found' });
    }
}
