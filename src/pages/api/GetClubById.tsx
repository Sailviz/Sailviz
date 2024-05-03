import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'
import assert from 'assert';

async function getClub(id: string) {
    var result = await prisma.club.findFirst({
        where: {
            id: id
        }
    })
    if (result == null) {
        return
    }
    return result;
}

const GetClubById = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        assert.notStrictEqual(undefined, req.body.id);
    } catch (bodyError) {
        res.json({ error: true, message: "information missing" });
        return;
    }
    var id = req.body.id
    if (req.method === 'POST') {
        var club = await getClub(id)
        if (club) {
            res.json({ error: false, club: club });
        }
        else {
            res.json({ error: true, message: 'Could not find club' });
        }
    }
};

export default GetClubById