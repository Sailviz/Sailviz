import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

async function findUser(uuid: string) {
    const result = await prisma.user.findUnique({
        where: {
            uuid: uuid,
        },
    })
    return result;
}

async function authUser(email: string, password: string) {
    var user = await findUser(email);
    if (user == null) { return false }
    var result = bcrypt.compare(password, user.password);
    return result;
}

//synonymous with log in
const Authenticate = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(null, req.body.uuid, 'Email required');
        } catch (bodyError) {
            res.json({ error: true, message: "email or password missing" });
        }

        const uuid = req.body.uuid;

        var user = await findUser(uuid)
        if (user) {
            const token = jwt.sign(
                { displayName: user.displayName, username: user.username, id: user.id },
                jwtSecret,
                { expiresIn: '364d' }
            );
            res.json({ error: false, token: token, club: user.clubId, user: user.id });
            return;
        } else {
            console.log('user not found')
            return;
        }
    }
    else {
        res.json({ error: true, message: 'Wrong email or password' });
        return;
    }
}

export default Authenticate