import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function findFleet(fleetId: any) {
    var result = await prisma.fleet.findUnique({
        where: {
            id: fleetId
        },
        include: {
            results: {
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
            },
            fleetSettings: true
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    const cookieStore = cookies()
    const searchParams = request.nextUrl.searchParams

    var id = searchParams.get('id')

    if (id == undefined) {
        return NextResponse.json({ error: "can't find fleet" }, { status: 400 })
    }
    var fleet = await findFleet(id)
    if (fleet) {
        return NextResponse.json(fleet)
    } else {
        return NextResponse.json({ error: "can't find fleet" }, { status: 406 })
    }
}
