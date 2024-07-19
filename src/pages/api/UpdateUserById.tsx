import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';
import { connect } from 'http2';

//this only updates the settings part of the club record

async function updateUser(user: UserDataType) {
    console.log(user)
    var result = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            displayName: user.displayName,
            roles: {
                connect: user.roles.map(role => ({ id: role.id }))

            }
        }
    })
    return result;
}

const UpdateUserById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.user);
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var user: UserDataType = req.body.user


        var updatedUser = await updateUser(user)
        if (updatedUser) {
            res.json({ error: false, user: updatedUser });
        } else {
            // user is not there
            res.json({ error: true, message: 'user not found' });
        }
    }
};

export default UpdateUserById