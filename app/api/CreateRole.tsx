import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findClub(clubId: string) {
    var result = await prisma.club.findUnique({
        where: {
            id: clubId,
        },
    })
    return result;
}

async function createRole(clubId: string) {
    var user = await prisma.role.create({
        data: {
            clubId: clubId,
            name: "",
            permissions: {},
        },
    })
    return user;
}

const CreateRole = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.clubId, 'club required');

        } catch (bodyError) {
            res.status(400).json({ error: true, message: "information missing" });
            return;
        }
        var clubId = req.body.clubId

        //check club exists
        var club = await findClub(clubId)
        if (club == null) {
            res.json({ error: true, message: 'Club does not exist' });
            return;
        }

        var role = createRole(club.id)
        if (role) {
            res.json({ error: false, role: role });
            return;
        }
        else {
            res.json({ error: true, message: 'Something went wrong crating role account' });
        }

    }
};

export default CreateRole