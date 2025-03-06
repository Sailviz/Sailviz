import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from 'components/helpers/auth'

async function updateRole(role: RoleDataType) {
    var result = await prisma.role.update({
        where: {
            id: role.id
        },
        data: {
            name: role.name,
            permissions: role.permissions
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.role)
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var role: RoleDataType = req.role

    let authorised = await isRequestAuthorised(request.cookies, role.id, 'role')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var updatedRole = await updateRole(role)
    if (updatedRole) {
        return NextResponse.json({ res: updatedRole }, { status: 200 })
    }
    return NextResponse.json({ error: 'role not found' }, { status: 400 })
}
