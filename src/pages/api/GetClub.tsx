import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'

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
    var name: string = req.body.name
    console.log(name)
    if (req.method === 'POST') {
        var Club = await getClub(name)
        if(Club){
            res.status(200).json({error: false, Club: Club});
        }
        else{
            res.status(204).json({error: true, message: 'Could not find club'});
        }
    }
};