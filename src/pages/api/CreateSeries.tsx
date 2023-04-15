import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';


async function findSeries(name: string, clubId: any){
    var result = await prisma.series.findFirst({
        where: {
            name: name,
            clubId: clubId
        },
    })
    return result;
}

async function createSeries(name: string, clubId: string){
    var res = await prisma.series.create({
        data: {
            name: name,
            clubId: clubId,
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
            assert.notStrictEqual(undefined, req.body.clubId, 'Club required');
        } catch (bodyError) {
            res.json({error: true, message: "information missing"});
            return;
        }
        
        var name = req.body.name
        var clubId = req.body.clubId
        var ExistingSeries = await findSeries(name, clubId)
        if (!ExistingSeries) {
            var Series = await createSeries(name, clubId)
            res.json({error: false, series: Series})
            return
        }
        else {
            res.json({error: true, message: 'Something went wrong creating Series'});
        }
    }
};