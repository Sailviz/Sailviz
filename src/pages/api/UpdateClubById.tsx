import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

//this only updates the settings part of the club record

async function updateClub(club: ClubDataType) {
    var result = await prisma.club.update({
        where: {
            id: club.id
        },
        data: {
            settings: club.settings
        }
    })
    return result;
}

const UpdateClubById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.club);
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var club: ClubDataType = req.body.club


        var updatedBoat = await updateClub(club)
        if (updatedBoat) {
            res.json({ error: false, club: updatedBoat });
        } else {
            // club is not there
            res.json({ error: true, message: 'club not found' });
        }
    }
};

export default UpdateClubById