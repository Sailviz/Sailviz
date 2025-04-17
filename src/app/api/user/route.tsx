import prisma from '@/components/prisma'
import { omit } from 'cypress/types/lodash'
import { NextRequest, NextResponse } from 'next/server'

async function getUser(id: string) {
    var result = await prisma.user.findUnique({
        where: {
            id: id
        },
        include: {
            roles: true
        },
        omit: {
            password: true
        }
    })
    if (result == null) {
        return
    }
    return result
}

export async function GET(request: NextRequest) {
    var userId = request.cookies.get('userId')?.value
    if (userId == null) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }
    var user = await getUser(userId)
    if (user) {
        return NextResponse.json(user)
    } else {
        return NextResponse.json({ error: "can't find user" }, { status: 406 })
    }
}
