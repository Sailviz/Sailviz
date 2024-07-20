import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

//this only updates the settings part of the club record

async function updateUser(user: UserDataType) {
    console.log(user)
    var result = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            displayName: user.displayName,
            roles: {
                set: user.roles.map(role => ({ id: role.id }))

            }
        }
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.user);
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var user: UserDataType = req.user


    var updatedUser = await updateUser(user)
    if (updatedUser) {
        return Response.json({ error: false, user: updatedUser });
    } else {
        // user is not there
        return Response.json({ error: true, message: 'user not found' });
    }
}
