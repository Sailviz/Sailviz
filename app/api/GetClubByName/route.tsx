import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'components/prisma'
import assert from 'assert';

async function getClub(name: string) {
    var result = await prisma.club.findFirst({
        where: {
            name: name
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
        assert.notStrictEqual(undefined, req.name);
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }
    var name: string = req.name
    console.log(name)
    if (req.method === 'POST') {
        var club = await getClub(name)
        if (club) {
            return Response.json({ error: false, club: club });
        }
        else {
            return Response.json({ error: true, message: 'Could not find club' });
        }
    }
};
