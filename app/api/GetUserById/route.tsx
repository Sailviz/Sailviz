import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'components/prisma'
import assert from 'assert';

async function getUser(id: string) {
    var result = await prisma.user.findFirst({
        where: {
            id: id
        },
        omit: {
            password: true
        },
        include: {
            roles: true
        }
    })
    if (result == null) {
        return
    }
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
    console.log(id)
    if (req.method === 'POST') {
        var user = await getUser(id)
        if (user) {
            return Response.json({ error: false, user: user });
        }
        else {
            return Response.json({ error: true, message: 'Could not find user' });
        }
    }
}
