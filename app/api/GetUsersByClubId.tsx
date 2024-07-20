import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../components/prisma'
import assert from 'assert';

async function getUsers(clubId: string) {
    var result = await prisma.user.findMany({
        where: {
            clubId: clubId
        },
        omit: {
            password: true
        },
        include: {
            roles: true
        }
    })
    return result;
}

const GetUsersByClubId = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        assert.notStrictEqual(undefined, req.body.clubId);
    } catch (bodyError) {
        res.json({ error: true, message: "information missing" });
        return;
    }
    var clubId = req.body.clubId
    if (req.method === 'POST') {
        var user = await getUsers(clubId)
        if (user) {
            res.json({ error: false, users: user });
        }
        else {
            res.json({ error: true, message: 'Could not find user' });
        }
    }
};

export default GetUsersByClubId