import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
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
            startTime: "0",
            Type: "Handicap",
            OOD: "Unknown",
            AOD: "Unknown",
            SO: "Unknown",
            ASO: "Unknown",
            series: {
                connect: {
                    id: seriesId
                }
            }
        },
    })
    return res;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesId, 'Id required');
            assert.notStrictEqual(undefined, req.body.clubId, 'Club required');
            assert.notStrictEqual(undefined, req.body.time, 'time required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var seriesId = req.body.seriesId
        var clubId = req.body.clubId
        var time = req.body.time

        var races: RaceDataType[] = (await findRace(seriesId)) as RaceDataType[]
        var number = 1
        //this numbers the race with the lowest number that is not being used.
        while (races.some(object => object.number === number)) {
            number++;
        }
        if (races) {
            var race = await createRace(number, seriesId, time)
            res.json({ error: false, race: race });
        }
        else {
            res.json({ error: true, message: 'Could not find series' });
        }
    }
};