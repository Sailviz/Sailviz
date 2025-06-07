import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function findRole(role: RoleDataType) {
    var result = await prisma.role.findFirst({
        where: {
            id: role.id
        }
    })
    return result
}

async function deleteRole(role: RoleDataType) {
    var res = await prisma.role.delete({
        where: {
            id: role.id
        }
    })
    return res
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.role, 'role required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var role = req.role

    let authorised = await isRequestAuthorised(role.id, 'role')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var deletedRole = await findRole(role)
    if (deletedRole) {
        await deleteRole(role)
        return NextResponse.json({ res: deletedRole }, { status: 200 })
    }
    return NextResponse.json({ error: 'role not found' }, { status: 400 })
}
