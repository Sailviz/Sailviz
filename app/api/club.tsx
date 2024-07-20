import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../components/prisma'

async function getClub(id: string) {
    var result = await prisma.club.findUnique({
        where: {
            id: id
        },
    })
    if (result == null) {
        return
    }
    return result;
}

const GetClubById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        var id = req.cookies.clubId
        if (id == null) {
            res.status(400).end()
            return
        }
        var club = await getClub(id)
        if (club) {
            res.json(club);
        }
        else {
            res.status(406).end()
        }
    }
};

export default GetClubById