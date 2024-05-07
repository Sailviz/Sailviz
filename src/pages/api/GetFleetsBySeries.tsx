import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../components/prisma'
import assert from 'assert';


async function getSeries(seriesId: string) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        }
    })
    return result;
}
async function getFleets(seriesId: string) {
    var result = await prisma.fleet.findMany({
        where: {
            seriesId: seriesId
        },
        include: {
            boats: true
        }
    })
    if (result == null) {
        return
    }
    return result;
}

const GetFleetsBySeries = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        assert.notStrictEqual(undefined, req.body.seriesId);
    } catch (bodyError) {
        res.json({ error: true, message: "information missing" });
        return;
    }
    var seriesId = req.body.seriesId
    let series = await getSeries(seriesId)

    if (req.method === 'POST') {
        if (!series?.fleetsEnabled) {
            res.json({ error: true, message: 'Fleets not enabled for this series' });
            return;
        }
        var fleet = await getFleets(seriesId)
        if (fleet) {
            res.json({ error: false, fleet: fleet });
        }
        else {
            res.json({ error: true, message: 'Could not find fleet' });
        }
    }
};

export default GetFleetsBySeries