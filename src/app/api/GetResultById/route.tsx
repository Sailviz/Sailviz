import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'

async function findResult(id: any) {
    var result = await prisma.result.findFirst({
        where: {
            id: id
        },
        include: {
            boat: true,
            laps: {
                where: {
                    isDeleted: false
                },
                orderBy: {
                    time: 'asc'
                }
            }
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    var id = searchParams.get('id')

    var result = await findResult(id)
    if (result) {
        return NextResponse.json({ error: false, result: result })
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'result not found' })
    }
}
