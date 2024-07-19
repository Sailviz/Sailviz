import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'
import assert from 'assert';

async function getRoles(clubId: string) {
    var result = await prisma.role.findMany({
        where: {
            clubId: clubId
        },
    })
    return result;
}

const GetRolesByClubId = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        assert.notStrictEqual(undefined, req.body.clubId);
    } catch (bodyError) {
        res.json({ error: true, message: "information missing" });
        return;
    }
    var clubId = req.body.clubId
    if (req.method === 'POST') {
        var roles = await getRoles(clubId)
        if (roles) {
            res.json({ error: false, roles: roles });
        }
        else {
            res.json({ error: true, message: 'Could not find roles' });
        }
    }
};

export default GetRolesByClubId