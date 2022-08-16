import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

async function findBoat(name: string){
    var result = await prisma.boats.findUnique({
        where: {
            name: name,
        },
    })
    return result;
}

async function createBoat(name: string, crew: number, py: number){
    var boat = await prisma.boats.create({
        data: {
            name: name,
            crew: crew,
            py: py
        },
    })
    return boat;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops empty fields, this stops missing fields
        try {
            assert.notStrictEqual(undefined, req.body.name);
            assert.notStrictEqual(undefined, req.body.crew);
            assert.notStrictEqual(undefined, req.body.py);

        } catch (bodyError) {
            res.status(403).json({error: true, message: "information missing"});
            return;
        }
        
        var name = req.body.name
        var crew = req.body.crew
        var py = req.body.py

        var ExistingBoat = await findBoat(name)
        if (!ExistingBoat) {
            var creationResult = await createBoat(name, crew, py)
            if (creationResult) {
                res.status(201).json({error: false});
                return;
            }
            else{
                res.status(500).json({error: true, message: 'Something went wrong crating boat'});
            }
        } else {
            res.status(409).json({error: true, message: 'Boat already exists'});
            return;
        }
    }
};