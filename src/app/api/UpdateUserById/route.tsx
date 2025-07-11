import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import assert from 'assert'
import { AVAILABLE_PERMISSIONS } from '@/components/helpers/users'
import { isRequestAuthorised, isRequestOwnData } from '@/components/helpers/auth'
const saltRounds = 10

//this only updates the settings part of the club record

async function updateUser(user: UserDataType) {
    var result = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            clubId: user.clubId,
            username: user.username,
            startPage: user.startPage,
            displayUsername: user.displayUsername,
            roles: {
                set: user.roles.map(role => ({ id: role.id }))
            }
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.user)
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var user: UserDataType = req.user

    await isRequestOwnData(user.id, '', 'club')

    var updatedUser = await updateUser(user)
    if (updatedUser) {
        return NextResponse.json({ res: updatedUser }, { status: 200 })
    }
    return NextResponse.json({ error: 'user not found' }, { status: 400 })
}
