import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

async function findUser(username: string) {
    const result = await prisma.user.findUnique({
        where: {
            username: username,
        },
    })
    return result;
}

async function authUser(username: string, password: string) {
    var user = await findUser(username);
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
            assert.notStrictEqual(null, req.body.username, 'username required');
            assert.notStrictEqual(null, req.body.password, 'Password required');
        } catch (bodyError) {
            res.json({ error: true, message: "username or password missing" });
        }

        const username = req.body.username;
        const password = req.body.password;

        var user = await findUser(username)
        if (user) {
            var result = await authUser(username, password)
            if (result) {
                const token = jwt.sign(
                    { username: user.username, displayName: user.displayName, id: user.id },
                    jwtSecret,
                    { expiresIn: '364d' }
                );
                res.json({ error: false, token: token, user: user });
                return;
            } else {
                res.json({ error: true, message: 'Wrong username or password' });
                return;
            }
        }
        else {
            res.json({ error: true, message: 'Wrong username or password' });
            return;
        }
    }
};

export default Authenticate