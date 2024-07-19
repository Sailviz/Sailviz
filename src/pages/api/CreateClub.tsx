import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findClub(name: string) {
    var result = await prisma.club.findUnique({
        where: {
            name: name,
        },
    })
    return result;
}

async function createClub(name: string) {
    var club = await prisma.club.create({
        data: {
            name: name,
            settings: {}
        },
    })
    return club;
}

const CreateBoat = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.name, 'Name required');
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var name = req.body.name

        var Existingclub = await findClub(name)
        if (!Existingclub) {
            var Club = await createClub(name)
            if (Club) {
                res.json({ error: false, Club: Club });
                return;
            }
            else {
                res.json({ error: true, message: 'Something went wrong crating club' });
            }
        } else {
            // User exists
            res.json({ error: true, message: 'club already exists' });
            return;
        }
    }
};

export default CreateBoat