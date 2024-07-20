import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs';

import assert from 'assert';

async function findRace(clubId: string) {
    var result = await prisma.race.findMany({
        where: {
            AND: [{
                Time: {
                    gte: dayjs().set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss'),
                    lte: dayjs().set('hour', 24).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss')
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
        select: {
            id: true,
            number: true,
            Time: true,
            series: {
                select: {
                    name: true
                }
            }
        }
    })
    return result;
}

const GetTodaysRaceByClubId = async (req: NextApiRequest, res: NextApiResponse) => {
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
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};

export default GetTodaysRaceByClubId