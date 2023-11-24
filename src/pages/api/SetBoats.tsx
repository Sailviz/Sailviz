import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import assert from 'assert';
const saltRounds = 10;
const jwtSecret = process.env.jwtSecret;

async function deleteAll(clubId: string) {
    await prisma.boats.deleteMany({
        where: {
            clubId: clubId,
        },
    })
    return
}

async function createAll(clubId: string, data: BoatDataType[]) {
    for (var i = 0; i < data.length; i++) {

        data[i]!.clubId = clubId
    }
    var boat = await prisma.boats.createMany({
        data: data
    })
    return boat;
}

const SetBoats = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops empty fields, this stops missing fields
        try {
            assert.notStrictEqual(undefined, req.body.clubId);
            assert.notStrictEqual(undefined, req.body.data);
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var clubId = req.body.clubId
        var data = req.body.data
        deleteAll(clubId)
        createAll(clubId, data)
        res.json({ error: false });
    }
};

export default SetBoats