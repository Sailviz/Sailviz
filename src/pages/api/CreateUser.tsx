import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

async function findUser(username: string) {
    var result = await prisma.users.findUnique({
        where: {
            username: username,
        },
    })
    return result;
}

async function findClub(clubId: string) {
    var result = await prisma.clubs.findUnique({
        where: {
            id: clubId,
        },
    })
    return result;
}

async function createUser(displayName: string, username: string, password: string, clubId: string, permLvl: number) {
    var hash = await bcrypt.hash(password, saltRounds)
    var user = await prisma.users.create({
        data: {
            username: username,
            displayName: displayName,
            password: hash,
            settings: {},
            clubId: clubId,
            permLvl: permLvl,
        },
    })
    return user;
}

const CreateUser = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.username, 'username required');
            assert.notStrictEqual(undefined, req.body.password, 'Password required');
            assert.notStrictEqual(undefined, req.body.displayName, 'Name required');
            assert.notStrictEqual(undefined, req.body.clubId, 'club required');
            assert.notStrictEqual(undefined, req.body.permLvl, 'permLvl required');

        } catch (bodyError) {
            res.status(400).json({ error: true, message: "information missing" });
            return;
        }

        var displayName = req.body.displayName
        var username = req.body.username
        var password = req.body.password
        var clubId = req.body.clubId
        var permLvl = req.body.permLvl

        //check club exists
        var club = await findClub(clubId)
        if (club == null) {
            res.json({ error: true, message: 'Club does not exist' });
            return;
        }

        var Existinguser = await findUser(username)
        if (!Existinguser) {
            var creationResult = await createUser(displayName, username, password, club.id, permLvl)
            if (creationResult) {
                var user = creationResult;
                var token = jwt.sign(
                    { userId: user.displayName, username: user.username, id: user.id },
                    jwtSecret,
                    {
                        expiresIn: '1d', //1 day
                    },
                );
                res.json({ error: false, token: token });
                return;
            }
            else {
                res.json({ error: true, message: 'Something went wrong crating user account' });
            }
        } else {
            // User exists
            res.json({ error: true, message: 'username already exists' });
            return;
        }
    }
};

export default CreateUser