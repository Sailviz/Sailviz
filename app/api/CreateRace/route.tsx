import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';


async function findRace(seriesId: any) {
    var result = await prisma.race.findMany({
        where: {
            seriesId: seriesId
        },
    })
    return result;
}

async function createRace(number: number, seriesId: any, time: any) {
    var res = await prisma.race.create({
        data: {
            number: number,
            Time: time,
            Type: "Handicap",
            OOD: "",
            AOD: "",
            SO: "",
            ASO: "",
            series: {
                connect: {
                    id: seriesId
                }
            }
        },
    })
    return res;
}

async function createFleets(raceId: string, seriesId: string) {
    // find fleets on series
    var fleets = await prisma.fleetSettings.findMany({
        where: {
            seriesId: seriesId
        }
    })
    // create fleet for each fleet setting
    fleets.forEach(async (fleet) => {
        await prisma.fleet.create({
            data: {
                startTime: 0,
                fleetSettings: {
                    connect: {
                        id: fleet.id
                    }
                },
                race: {
                    connect: {
                        id: raceId
                    }
                }
            }
        })
    })
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId, 'Id required');
        assert.notStrictEqual(undefined, req.clubId, 'Club required');
        assert.notStrictEqual(undefined, req.time, 'time required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
        return;
    }

    var seriesId = req.seriesId
    var clubId = req.clubId
    var time = req.time

    var races: RaceDataType[] = (await findRace(seriesId)) as RaceDataType[]
    var number = 1
    //this numbers the race with the lowest number that is not being used.
    while (races.some(object => object.number === number)) {
        number++;
    }
    if (races) {
        var race = await createRace(number, seriesId, time)
        createFleets(race.id, seriesId)
        return NextResponse.json({ error: false, race: race });
    }
    else {
        return NextResponse.json({ error: true, message: 'Could not find series' });
    }

};