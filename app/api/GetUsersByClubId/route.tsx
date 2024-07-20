import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'components/prisma'
import assert from 'assert';

async function getUsers(clubId: string) {
    var result = await prisma.user.findMany({
        where: {
            clubId: clubId
        },
        omit: {
            password: true
        },
        include: {
            roles: true
        }
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
        var user = await getUsers(clubId)
        if (user) {
            return Response.json({ error: false, users: user });
        }
        else {
            return Response.json({ error: true, message: 'Could not find user' });
        }
    }
}