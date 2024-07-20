import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findRole(role: RoleDataType) {
    var result = await prisma.role.findFirst({
        where: {
            id: role.id
        },
    })
    return result;
}

async function deleteRole(role: RoleDataType) {
    var res = await prisma.role.delete({
        where: {
            id: role.id,
        }
    })
    return res;
}

const DeleteRole = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.role, 'role required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var role = req.body.role
        console.log("this")
        console.log(role)

        var deletedRole = await findRole(role)
        if (deletedRole) {
            await deleteRole(role)
            res.json({ error: false, role: deletedRole });
        } else {
            // Role exists
            res.json({ error: true, message: 'role not found' });
        }
    }

}

export default DeleteRole