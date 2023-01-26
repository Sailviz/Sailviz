import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function updateRace(id: any, OOD: string, AOD: string, SO: string, ASO: string, Time: string, Type: string, results: any) {
    var result = await prisma.race.update({
        where: {
            id: id
        },
        data: {
            OOD: OOD || undefined,
            AOD: AOD || undefined,
            SO: SO || undefined,
            ASO: ASO || undefined,
            Time: Time || undefined,
            Type: Type || undefined,
            results: results || undefined
        }
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id, 'id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        console.log(req.body)

        var id = req.body.id
        var OOD = req.body.OOD
        var AOD = req.body.AOD
        var SO = req.body.SO
        var ASO = req.body.ASO
        var Time = req.body.Time
        var Type = req.body.Type
        var results = req.body.results

        var race = await updateRace(id, OOD, AOD, SO, ASO, Time, Type, results)
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};