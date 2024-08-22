import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findRace(id: any) {
    var result = await prisma.race.findFirst({
        where: {
            id: id
        },
        include: {
            fleets: {
                include: {
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
                    },
                    fleetSettings: true
                }

            },
            series: true
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id);

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var id = req.id

    var race = await findRace(id)
    if (race) {
        return NextResponse.json({ error: false, race: race });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' });
    }
}
