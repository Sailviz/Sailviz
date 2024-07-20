import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';


async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        },
        include: {
            races: true
        }
    })
    return result;
}

async function createFleetSettings(seriesId: string) {
    var res = await prisma.fleetSettings.create({
        data: {
            name: "Fleet",
            startDelay: 0,
            series: {
                connect: {
                    id: seriesId
                }
            }
        },
    })
    return res;
}

async function createFleet(raceId: string, fleetSettingsId: string) {
    var res = await prisma.fleet.create({
        data: {
            startTime: 0,
            fleetSettings: {
                connect: {
                    id: fleetSettingsId
                }
            },
            race: {
                connect: {
                    id: raceId
                }
            }
        }
    })
    return res;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId, 'Id required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var seriesId = req.seriesId

    var series = await findSeries(seriesId)

    if (series) {
        var fleetSettings = await createFleetSettings(seriesId)
        series.races.forEach((race) => {
            createFleet(race.id, fleetSettings.id)

        }
        )
        return NextResponse.json({ error: false, fleet: fleetSettings });
    }
    else {
        return NextResponse.json({ error: true, message: 'Could not find series' });
    }
};
