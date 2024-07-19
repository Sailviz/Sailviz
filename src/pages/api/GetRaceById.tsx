import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findRace(id: any) {
    var result = await prisma.race.findFirst({
        where: {
            id: id
        },
        include: {
            fleets: {
                include: {
                    results: {
                        where: {
                            isDeleted: false
                        },
                        include: {
                            boat: true,
                            laps: {
                                where: {
                                    isDeleted: false
                                },
                                orderBy: {
                                    time: 'asc'
                                }
                            }
                        }
                    },
                    fleetSettings: true
                }

            },
            series: true
        }
    })
    return result;
}

const GetRaceById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var id = req.body.id

        var race = await findRace(id)
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};

export default GetRaceById