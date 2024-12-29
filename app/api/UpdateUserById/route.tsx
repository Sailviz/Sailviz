import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require('bcrypt');
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';
const saltRounds = 10;

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
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    let authorised = await isRequestAuthorised(request.cookies.get("token")!.value, AVAILABLE_PERMISSIONS.editUsers)
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var user: UserDataType = req.user
    var password: string = req.password

    var updatedUser = await updateUser(user, password)
    if (updatedUser) {
        return NextResponse.json({ res: updatedUser }, { status: 200 });
    }
    return NextResponse.json({ error: 'user not found' }, { status: 400 });
}
