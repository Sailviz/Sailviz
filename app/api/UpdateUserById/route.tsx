import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

//this only updates the settings part of the club record

async function updateUser(user: UserDataType, password: string) {
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

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.user);
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var user: UserDataType = req.user
    var password: string = req.password

    var updatedUser = await updateUser(user, password)
    if (updatedUser) {
        return NextResponse.json({ error: false, user: updatedUser });
    } else {
        // user is not there
        return NextResponse.json({ error: true, message: 'user not found' });
    }
}
