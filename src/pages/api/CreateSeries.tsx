import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function createSeries(seriesName: string, clubId: string) {
    var res = await prisma.series.create({
        data: {
            name: seriesName,
            settings: {},
            club: {
                connect: {
                    id: clubId
                }
            }
        },
    })
    return res;
}

const CreateSeries = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesName, 'Name required');
            assert.notStrictEqual(undefined, req.body.clubId, 'Club required');
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var seriesName = req.body.seriesName
        var clubId = req.body.clubId
        var Series = await createSeries(seriesName, clubId)
        if (Series) {
            res.json({ error: false, series: Series })
        }
        else {
            res.json({ error: true, message: 'Something went wrong creating Series' });
        }
    }
};

export default CreateSeries