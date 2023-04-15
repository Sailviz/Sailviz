import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'
import assert from 'assert';
import Club from '../Dashboard';

async function getBoats(clubId: string){
    var result = await prisma.boats.findMany({
        where: {
            clubId: clubId
        }
    })
    if (result == null){
        return
    }
    return result;
}

export default  async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        try {
            assert.notStrictEqual(undefined, req.body.clubId);
        } catch (bodyError) {
            res.json({error: true, message: "information missing"});
            return;
        }
        
        var clubId = req.body.clubId
        var boats = await getBoats(clubId)
        if(boats){
            res.json({error: false, boats: boats});
        }
        else{
            res.json({error: true, message: 'Could not find boats'});
        }
    }
};