import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

//this only updates the settings part of the club record

async function updateUser(user: UserDataType, password: string) {
    var hash = await bcrypt.hash(password, saltRounds)
    var result = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            displayName: user.displayName,
            username: user.username,
            roles: {
                set: user.roles.map(role => ({ id: role.id }))

            },
            ...password != "" ? { password: hash } : {}
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
