import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';

async function findUser(user: UserDataType) {
    var result = await prisma.user.findFirst({
        where: {
            id: user.id
        },
    })
    return result;
}

async function deleteUser(user: UserDataType) {
    var res = await prisma.user.delete({
        where: {
            id: user.id,
        }
    })
    return res;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.user, 'user required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var user = req.user
    console.log("this")
    console.log(user)

    var deletedUser = await findUser(user)
    if (deletedUser) {
        await deleteUser(user)
        return NextResponse.json({ error: false, user: deletedUser });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'user not found' });
    }
}

