import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'
import assert from 'assert';

async function getBoats(){
    var result = await prisma.boats.findMany()
    if (result == null){
        return
    }
    return result;
}

export default  async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        var boats = await getBoats()
        if(boats){
            res.json({error: false, boats: boats});
        }
        else{
            res.json({error: true, message: 'Could not find boats'});
        }
    }
};