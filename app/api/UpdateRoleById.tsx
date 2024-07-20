import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

//this only updates the settings part of the club record

async function updateRole(role: RoleDataType) {
    console.log(role)
    var result = await prisma.role.update({
        where: {
            id: role.id
        },
        data: {
            name: role.name,
            permissions: role.permissions
        }
    })
    return result;
}

const UpdateRoleById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.role);
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var role: RoleDataType = req.body.role


        var updatedRole = await updateRole(role)
        if (updatedRole) {
            res.json({ error: false, role: updatedRole });
        } else {
            // role is not there
            res.json({ error: true, message: 'role not found' });
        }
    }
};

export default UpdateRoleById