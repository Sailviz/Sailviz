import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

async function findRace(id: any, results: boolean) {
    var result = await prisma.race.findFirst({
        where: {
            id: id
        },
        include: {
            fleets: {
                include: {
                    ...(results
                        ? {
                              results: {
                                  where: {
                                      isDeleted: false
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
                              }
                          }
                        : {}),
                    fleetSettings: true
                }
            },
            series: true
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    var id = searchParams.get('id')
    var results = searchParams.get('results') === 'true'

    if (id == undefined || results == undefined) {
        return NextResponse.json({ error: "can't find race" }, { status: 400 })
    }
    var race = await findRace(id, results)
    if (race) {
        return NextResponse.json(race)
    } else {
        return NextResponse.json({ error: "can't find race" }, { status: 406 })
    }
}
