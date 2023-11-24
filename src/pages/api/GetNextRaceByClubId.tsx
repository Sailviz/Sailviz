import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs';

import assert from 'assert';

async function findRace(clubId: string) {
    var result = await prisma.race.findMany({
        where: {
            AND: [{
                Time: {
                    gte: dayjs().toISOString()
                }
            }, {
                series: {
                    clubId: clubId
                }
            }]


        },
        orderBy: {
            Time: 'asc'
        },
        take: 1,
        select: {
            id: true,
            number: true,
            series: {
                select: {
                    name: true
                }
            }
        }
    })
    return result;
}

const GetNextRaceByClubId = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.clubId);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var clubId = req.body.clubId

        var race = await findRace(clubId)
        if (race[0]) {
            res.json({ error: false, race: race[0] });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};

export default GetNextRaceByClubId