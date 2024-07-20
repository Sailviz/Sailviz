import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findResult(id: any) {
    var result = await prisma.result.findFirst({
        where: {
            id: id
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
    })
    return result;
}

const GetResultById = async (req: NextApiRequest, res: NextApiResponse) => {
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

        var result = await findResult(id)
        if (result) {
            res.json({ error: false, result: result });
        } else {
            // User exists
            res.json({ error: true, message: 'result not found' });
        }
    }
};

export default GetResultById