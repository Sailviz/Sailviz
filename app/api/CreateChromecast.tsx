import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function createChromecast(chromecast: ChromecastDataType) {
    var res = await prisma.chromecasts.create({
        data: {
            name: chromecast.name,
            host: chromecast.host,
            settings: {},
            club: {
                connect: {
                    id: chromecast.clubId
                }
            }
        },
    })
    return res;
}


const CreateChromecast = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.chromecast, 'Name required');
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var chromecastdata = req.body.chromecast
        var chromecast = await createChromecast(chromecastdata)
        if (chromecast) {
            res.json({ error: false, chromecast: chromecast })
        }
        else {
            res.json({ error: true, message: 'Something went wrong creating chromecast' });
        }
    }
};

export default CreateChromecast