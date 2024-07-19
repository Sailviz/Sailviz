import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findUser(user: UserDataType) {
    var result = await prisma.user.findFirst({
        where: {
            id: user.id
        },
    })
    return result;
}

async function deleteUser(user: UserDataType) {
    var res = await prisma.user.delete({
        where: {
            id: user.id,
        }
    })
    return res;
}

const DeleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.user, 'user required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var user = req.body.user
        console.log("this")
        console.log(user)

        var deletedUser = await findUser(user)
        if (deletedUser) {
            await deleteUser(user)
            res.json({ error: false, user: deletedUser });
        } else {
            // User exists
            res.json({ error: true, message: 'user not found' });
        }
    }

}

export default DeleteUser