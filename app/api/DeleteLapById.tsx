import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function deleteLap(id: string) {
    var res = await prisma.lap.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true
        }
    })
    return res;
}

const DeleteLap = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id, 'Id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var id = req.body.id

        var lap = await deleteLap(id)
        if (!lap) {
            res.json({ error: true, message: 'Could not delete lap' });
            return
        }
        res.json({ error: false, result: lap });
    }

}

export default DeleteLap