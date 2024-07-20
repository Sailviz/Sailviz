import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'components/prisma'
import assert from 'assert';

async function getClub(id: string) {
    var result = await prisma.club.findFirst({
        where: {
            id: id
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
    if (req.method === 'POST') {
        var club = await getClub(id)
        if (club) {
            return Response.json({ error: false, club: club });
        }
        else {
            return Response.json({ error: true, message: 'Could not find club' });
        }
    }
}