import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'
import assert from 'assert';

async function getClub(name: string){
    var result = await prisma.clubs.findFirst({
        where: {
            name: name
        }
    })
    if (result == null){
        return
    }
    return result;
}

export default  async(req: NextApiRequest, res: NextApiResponse) => {
    try {
        assert.notStrictEqual(undefined, req.body.name, 'Name required');
    } catch (bodyError) {
        res.json({error: true, message: "information missing"});
        return;
    }
    var name: string = req.body.name
    console.log(name)
    if (req.method === 'POST') {
        var club = await getClub(name)
        if(club){
            res.json({error: false, club: club});
        }
        else{
            res.json({error: true, message: 'Could not find club'});
        }
    }
};