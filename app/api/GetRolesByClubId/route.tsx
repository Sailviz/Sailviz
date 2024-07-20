import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'components/prisma'
import assert from 'assert';

async function getRoles(clubId: string) {
    var result = await prisma.role.findMany({
        where: {
            clubId: clubId
        },
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId);
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
        return;
    }
    var clubId = req.clubId
    if (req.method === 'POST') {
        var roles = await getRoles(clubId)
        if (roles) {
            return Response.json({ error: false, roles: roles });
        }
        else {
            return Response.json({ error: true, message: 'Could not find roles' });
        }
    }
};
