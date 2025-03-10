import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from 'components/helpers/auth'

async function findUser(user: UserDataType) {
    var result = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    })
    return result
}

async function deleteUser(user: UserDataType) {
    var res = await prisma.user.delete({
        where: {
            id: user.id
        }
    })
    return res
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.user, 'user required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var user = req.user

    let authorised = await isRequestAuthorised(request.cookies, user.id, 'user')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var deletedUser = await findUser(user)
    if (deletedUser) {
        await deleteUser(user)
        return NextResponse.json({ res: deletedUser }, { status: 200 })
    }
    return NextResponse.json({ error: 'user not found' }, { status: 400 })
}
