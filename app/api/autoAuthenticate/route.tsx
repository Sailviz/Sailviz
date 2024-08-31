import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

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
export async function POST(request: NextRequest) {
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(null, req.uuid, 'Email required');
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "email or password missing" });
    }

    const uuid = req.uuid;

    var user = await findUser(uuid)
    if (user) {
        const token = jwt.sign(
            { displayName: user.displayName, username: user.username, id: user.id },
            jwtSecret,
            { expiresIn: '364d' }
        );
        return NextResponse.json({ error: false, token: token, user: user });
    }
}
