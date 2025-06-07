import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const jwt = require('jsonwebtoken')
import bcrypt from 'bcryptjs'
import assert from 'assert'
const saltRounds = 10
const jwtSecret = process.env.jwtSecret

async function findUser(username: string) {
    const result = await prisma.user.findUnique({
        where: {
            username: username
        }
    })
    return result
}

async function authUser(username: string, password: string) {
    var user = await findUser(username)
    if (user == null) {
        return false
    }
    var result = bcrypt.compare(password, user.password!)
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(null, req.username, 'username required')
        assert.notStrictEqual(null, req.password, 'Password required')
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'username or password missing' })
    }

    const username = req.username
    const password = req.password

    var user = await findUser(username)
    if (user) {
        var result = await authUser(username, password)
        if (result) {
            const token = jwt.sign({ username: user.username, displayName: user.displayName, id: user.id }, jwtSecret, { expiresIn: '364d' })
            return NextResponse.json({ error: false, token: token, user: user })
        } else {
            return NextResponse.json({ error: true, message: 'Wrong username or password' })
        }
    } else {
        return NextResponse.json({ error: true, message: 'Wrong username or password' })
    }
}
