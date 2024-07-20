import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../components/prisma'

async function getUser(id: string) {
    var result = await prisma.user.findUnique({
        where: {
            id: id
        },
        select: {
            displayName: true,
            id: true,
            username: false,
            password: false,
            roles: true,
            clubId: true
        }
    })
    if (result == null) {
        return
    }
    return result;
}

const GetUserById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        var id = req.cookies.userId
        if (id == null) {
            res.status(400).end()
            return
        }
        var user = await getUser(id)
        if (user) {
            res.json(user);
        }
        else {
            res.status(406).end()
        }
    }
};

export default GetUserById