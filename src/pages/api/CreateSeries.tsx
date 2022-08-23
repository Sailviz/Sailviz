import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';
import { create } from 'domain';

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

async function createSeries(name: string, club: any){
    var res = await prisma.series.create({
        data: {
            name: name,
            clubId: club.id,
            settings: {}
        },
    })
    return res;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.name, 'Name required');
            assert.notStrictEqual(undefined, req.body.club, 'Club required');
        } catch (bodyError) {
            res.json({error: true, message: "information missing"});
            return;
        }
        
        var name = req.body.name
        var club = req.body.club

        club = await findClub(club)
        if (club) {
            var ExistingSeries = await findSeries(name, club)
            if (!ExistingSeries) {
                var Series = await createSeries(name, club)
                res.json({error: false, series: Series});
                return;
            }
            else{
                res.json({error: true, message: 'Something went wrong creating Series'});
            }
        } else {
            // User exists
            res.json({error: true, message: 'club not found'});
            return;
        }
    }
};