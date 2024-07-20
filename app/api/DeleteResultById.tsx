import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findResult(resultId: any) {
    var result = await prisma.result.findFirst({
        where: {
            id: resultId
        },
    })
    return result;
}

async function deleteResult(resultId: any) {
    var result = await prisma.result.delete({
        where: {
            id: resultId
        }
    })
    return result;
}

const DeleteResultById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.resultId, 'resultId required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        console.log(req.body)

        var resultId = req.body.resultId

        var result = await findResult(resultId)
        if (result) {
            await deleteResult(resultId)
            res.json({ error: false, result: result });
        } else {
            // User exists
            res.json({ error: true, message: 'result not found' });
        }
    }
};

export default DeleteResultById