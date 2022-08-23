import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findClub(name: string){
    var result = await prisma.clubs.findUnique({
        where: {
            name: name,
        },
    })
    return result;
}

async function findSeries(name: string, club: any){
    var result = await prisma.series.findFirst({
        where: {
            name: name,
            clubId: club.id
        },
    })
    return result;
}

async function findRace(number: Number, series: any){
    var result = await prisma.race.findFirst({
        where: {
            number: number,
            seriesId: series.id
        },
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.series, 'Name required');
            assert.notStrictEqual(undefined, req.body.number, 'Name required');
            assert.notStrictEqual(undefined, req.body.club, 'Club required');

        } catch (bodyError) {
            res.json({error: true, message: "information missing"});
            return;
        }
        
        var number = req.body.number
        var seriesName = req.body.series
        var club = req.body.club

        club = await findClub(club)
        if (club) {
            var series = await findSeries(seriesName, club)
            if (series) {
                var race = await findRace(number, series)
                res.json({error: false, race: race});
            }
            else{
                res.json({error: true, message: 'Could not find series'});
            }
        } else {
            // User exists
            res.json({error: true, message: 'club not found'});
            return;
        }
    }
};