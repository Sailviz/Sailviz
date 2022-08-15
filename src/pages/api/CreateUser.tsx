import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

async function findUser(email: string){
    var result = await prisma.users.findUnique({
        where: {
            email: email,
        },
    })
    return result;
}

async function createUser(name: string, email: string, password: string, club: string, permLvl: number){
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
            assert.notStrictEqual(undefined, req.body.club, 'club required');
            assert.notStrictEqual(undefined, req.body.permLvl, 'permLvl required');

        } catch (bodyError) {
            res.status(403).json({error: true, message: "information missing"});
            return;
        }
        
        var name = req.body.name
        var email = req.body.email
        var password = req.body.password
        var club = req.body.club
        var permLvl = req.body.permLvl

        var Existinguser = await findUser(email)
        if (!Existinguser) {
            var creationResult = await createUser(name, email, password, club, permLvl)
            if (creationResult) {
                var user = creationResult;
                var token = jwt.sign(
                    {userId: user.name, email: user.email, id: user.id},
                    jwtSecret,
                    {
                        expiresIn: 3000, //50 minutes
                    },
                );
                res.status(200).json({error: false, token: token});
                return;
            }
            else{
                res.status(500).json({error: true, message: 'Something went wrong crating user account'});
            }
        } else {
            // User exists
            res.status(403).json({error: true, message: 'Email already exists'});
            return;
        }
    }
};