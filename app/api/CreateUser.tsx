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

async function createUser(clubId: string) {
    var user = await prisma.user.create({
        data: {
            username: "",
            displayName: "",
            password: null,
            clubId: clubId,
            roles: {},
            startPage: 'Dashboard',
        },
    })
    return user;
}

const CreateUser = async (req: NextApiRequest, res: NextApiResponse) => {
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

        var user = await createUser(club.id)
        if (user) {
            res.json({ error: false, user: user });
            return;
        }
        else {
            res.json({ error: true, message: 'Something went wrong crating user account' });
        }

    }
};

export default CreateUser