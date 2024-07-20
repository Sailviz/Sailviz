import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../components/prisma'
import assert from 'assert';

async function getUser(id: string) {
    var result = await prisma.user.findFirst({
        where: {
            id: id
        },
        omit: {
            password: true
        },
        include: {
            roles: true
        }
    })
    if (result == null) {
        return
    }
    return result;
}

const GetUserById = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        assert.notStrictEqual(undefined, req.body.id);
    } catch (bodyError) {
        res.json({ error: true, message: "information missing" });
        return;
    }
    var id = req.body.id
    console.log(id)
    if (req.method === 'POST') {
        var user = await getUser(id)
        if (user) {
            res.json({ error: false, user: user });
        }
        else {
            res.json({ error: true, message: 'Could not find user' });
        }
    }
};

export default GetUserById