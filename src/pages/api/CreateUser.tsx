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
            assert.notStrictEqual(null, req.body.email, 'Email required');
            assert.notStrictEqual(null, req.body.password, 'Password required');
            assert.notStrictEqual(null, req.body.name, 'Name required');
            assert.notStrictEqual(null, req.body.club, 'club required');
            assert.notStrictEqual(null, req.body.permLvl, 'permLvl required');

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
            console.log("creating new user")
            // proceed to Create
            var creationResult = await createUser(name, email, password, club, permLvl)
            console.log(creationResult)
            if (creationResult) {
                var user = creationResult;
                var token = jwt.sign(
                    {userId: user.name, email: user.email, id: user.id},
                    jwtSecret,
                    {
                        expiresIn: 3000, //50 minutes
                    },
                );
                res.status(200).json({token});
                return;
            }
            else{
                console.log("failed to create user")
                res.status(500).json({error: true, message: 'Something went wrong crating user account'});
            }
        } else {
            // User exists
            res.status(403).json({error: true, message: 'Email already exists'});
            return;
        }
    }
};