import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findClub(name: string) {
    var result = await prisma.club.findUnique({
        where: {
            name: name,
        },
    })
    return result;
}

async function createClub(name: string) {
    var club = await prisma.club.create({
        data: {
            name: name,
            settings: {}
        },
    })
    return club;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.name, 'Name required');
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var name = req.name

    var Existingclub = await findClub(name)
    if (!Existingclub) {
        var Club = await createClub(name)
        if (Club) {
            return Response.json({ error: false, Club: Club });
        }
        else {
            return Response.json({ error: true, message: 'Something went wrong crating club' });
        }
    } else {
        // User exists
        return Response.json({ error: true, message: 'club already exists' });
    }

};
