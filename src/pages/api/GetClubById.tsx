import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'
import assert from 'assert';

async function getClub(clubId: string){
    var result = await prisma.clubs.findFirst({
        where: {
            id: clubId
        }
    })
    if (result == null){
        return
    }
    return result;
}

export default  async(req: NextApiRequest, res: NextApiResponse) => {
    try {
        assert.notStrictEqual(undefined, req.body.clubId);
    } catch (bodyError) {
        res.json({error: true, message: "information missing"});
        return;
    }
    var clubId = req.body.clubId
    if (req.method === 'POST') {
        var club = await getClub(clubId)
        if(club){
            res.json({error: false, club: club});
        }
        else{
            res.json({error: true, message: 'Could not find club'});
        }
    }
};