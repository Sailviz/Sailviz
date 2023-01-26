import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';
import { create } from 'domain';
import { createInterface } from 'readline';

async function findClub(name: string) {
    var result = await prisma.clubs.findUnique({
        where: {
            name: name,
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

async function findRace(series: any) {
    var result = await prisma.race.findMany({
        where: {
            seriesId: series.id
        },
    })
    return result;
}

async function createRace(number: number, series: any, time: any, results: any) {
    var res = await prisma.race.create({
        data: {
            number: number,
            seriesId: series.id,
            Time: time,
            Type: "Handicap",
            OOD: "Unknown",
            AOD: "Unknown",
            SO: "Unknown",
            ASO: "Unknown",
            results: results
        },
    })
    return res;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesName, 'Name required');
            assert.notStrictEqual(undefined, req.body.club, 'Club required');
            assert.notStrictEqual(undefined, req.body.time, 'time required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var seriesName = req.body.seriesName
        var club = req.body.club
        var time = req.body.time
        var results = [{
            "Helm": "",
            "Crew": "",
            "BoatClass": "",
            "BoatNumber": "",
            "Time": 0,
            "Laps": 0,
            "Position": 0
        }]

        club = await findClub(club)
        if (club) {
            var series = await findSeries(seriesName, club)
            var number = (await findRace(series)).length + 1
            if (series) {
                var race = await createRace(number, series, time, results)
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