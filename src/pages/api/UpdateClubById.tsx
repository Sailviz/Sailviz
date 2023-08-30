import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

//this only updates the settings part of the club record

async function updateClub(id: string, settings: SettingsType) {
    var result = await prisma.clubs.update({
        where: {
            id: id
        },
        data: {
            settings: settings
        }
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id);
            assert.notStrictEqual(undefined, req.body.settings);
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var id: string = req.body.id
        var settings: SettingsType = req.body.settings


        var updatedBoat = await updateClub(id, settings)
        if (updatedBoat) {
            res.json({ error: false, club: updatedBoat });
        } else {
            // club is not there
            res.json({ error: true, message: 'club not found' });
        }
    }
};