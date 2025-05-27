import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import assert from 'assert'

async function getRole(id: string) {
    var result = await prisma.role.findUnique({
        where: {
            id: id
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id)
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }
    var roleId = req.id
    const role = await getRole(roleId)
    if (role) {
        return NextResponse.json({ error: false, role: role })
    } else {
        return NextResponse.json({ error: true, message: 'Could not find roles' })
    }
}
