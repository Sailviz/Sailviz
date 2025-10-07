import { NextRequest, NextResponse } from 'next/server'
import prisma from '@lib/prisma'
import assert from 'assert'
import { auth } from '@lib/auth'
import { headers } from 'next/headers'

async function getClubs(includeStripe: boolean) {
    var result = await prisma.club.findMany({
        include: {
            stripe: includeStripe
        },
        orderBy: { displayName: 'asc' }
    })
    return result
}

export async function GET(request: NextRequest) {
    let includeStripe = false
    //if authenticated and admin, include stripe info
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (session && session.user && session.user.admin) {
        includeStripe = true
    }
    var clubs = await getClubs(includeStripe)
    if (clubs) {
        return NextResponse.json(clubs)
    } else {
        return NextResponse.json({ error: true, message: 'Could not find club' })
    }
}
