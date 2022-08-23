import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';
import { create } from 'domain';
import { createInterface } from 'readline';

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

async function createRace(number: Number, series: any, time: Date){
    var res = await prisma.race.create({
        data: {
            number: number,
            seriesId: series.id,
            dateTime: time,
            settings: {},
            OOD: "Unknown",
            AOD: "Unknown",
            SO: "Unknown",
            ASO: "Unknown",
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
            assert.notStrictEqual(undefined, req.body.number, 'Name required');
            assert.notStrictEqual(undefined, req.body.club, 'Club required');
            assert.notStrictEqual(undefined, req.body.time, 'time required');

        } catch (bodyError) {
            res.json({error: true, message: "information missing"});
            return;
        }
        
        var number = req.body.number
        var seriesName = req.body.seriesName
        var club = req.body.club
        var time: Date = req.body.time

        club = await findClub(club)
        if (club) {
            var series = await findSeries(seriesName, club)
            if (series) {
                var ExistingRace = await findRace(number, series)
                if(!ExistingRace){
                    var race = await createRace(number, series, time)
                    res.json({error: false, race: race});
                } else {
                    res.json({error: true, message: "Race with that number already exists in series"});

                }
                
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