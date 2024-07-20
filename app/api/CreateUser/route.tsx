import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findClub(clubId: string) {
    var result = await prisma.club.findUnique({
        where: {
            id: clubId,
        },
    })
    return result;
}

async function createUser(clubId: string) {
    var user = await prisma.user.create({
        data: {
            username: "",
            displayName: "",
            password: null,
            clubId: clubId,
            roles: {},
            startPage: 'Dashboard',
        },
    })
    return user;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId, 'club required');

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId

    //check club exists
    var club = await findClub(clubId)
    if (club == null) {
        return Response.json({ error: true, message: 'Club does not exist' });
    }

    var user = await createUser(club.id)
    if (user) {
        return Response.json({ error: false, user: user });
    }
    else {
        return Response.json({ error: true, message: 'Something went wrong crating user account' });
    }

}
