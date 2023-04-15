import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

async function findUser(email: string) {
    var result = await prisma.users.findUnique({
        where: {
            email: email,
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

async function createUser(name: string, email: string, password: string, club: string, permLvl: number) {
    var hash = await bcrypt.hash(password, saltRounds)
    var user = await prisma.users.create({
        data: {
            email: email,
            name: name,
            password: hash,
            settings: {},
            club: club,
            permLvl: permLvl,
        },
    })
    return user;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.email, 'Email required');
            assert.notStrictEqual(undefined, req.body.password, 'Password required');
            assert.notStrictEqual(undefined, req.body.name, 'Name required');
            assert.notStrictEqual(undefined, req.body.clubId, 'club required');
            assert.notStrictEqual(undefined, req.body.permLvl, 'permLvl required');

        } catch (bodyError) {
            res.status(400).json({ error: true, message: "information missing" });
            return;
        }

        var name = req.body.name
        var email = req.body.email
        var password = req.body.password
        var clubId = req.body.clubId
        var permLvl = req.body.permLvl

        //check club exists
        var club = await findClub(clubId)
        if (club == null) {
            res.json({ error: true, message: 'Club does not exist' });
            return;
        }

        var Existinguser = await findUser(email)
        if (!Existinguser) {
            var creationResult = await createUser(name, email, password, club.name, permLvl)
            if (creationResult) {
                var user = creationResult;
                var token = jwt.sign(
                    { userId: user.name, email: user.email, id: user.id },
                    jwtSecret,
                    {
                        expiresIn: 3000, //50 minutes
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
            res.json({ error: true, message: 'Email already exists' });
            return;
        }
    }
};