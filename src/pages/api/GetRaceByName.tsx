import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findClub(clubId: string) {
    var result = await prisma.clubs.findUnique({
        where: {
            id: clubId,
        },
    })
    return result;
}

async function findSeries(name: string, club: any) {
    var result = await prisma.series.findFirst({
        where: {
            name: name,
            clubId: club.id
        },
    })
    return result;
}

async function findRace(raceNumber: number, series: any) {
    var result = await prisma.race.findFirst({
        where: {
            number: raceNumber,
            seriesId: series.id
        },
    })
    return result;
}

const GetRaceByName = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesName);
            assert.notStrictEqual(undefined, req.body.raceNumber);
            assert.notStrictEqual(undefined, req.body.clubId);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var raceNumber = req.body.raceNumber
        var seriesName = req.body.seriesName
        var clubId = req.body.clubId

        var club = await findClub(clubId)
        if (club) {
            var series = await findSeries(seriesName, club)
            if (series) {
                var race = await findRace(raceNumber, series)
                res.json({ error: false, race: race });
            }
            else {
                res.json({ error: true, message: 'Could not find series' });
            }
        } else {
            // User exists
            res.json({ error: true, message: 'club not found' });
            return;
        }
    }
};

export default GetRaceByName