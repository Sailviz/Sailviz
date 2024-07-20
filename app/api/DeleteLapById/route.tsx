import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';

async function deleteLap(id: string) {
    var res = await prisma.lap.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true
        }
    })
    return res;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id, 'Id required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var id = req.id

    var lap = await deleteLap(id)
    if (!lap) {
        return NextResponse.json({ error: true, message: 'Could not delete lap' });
    }
    return NextResponse.json({ error: false, result: lap });
}

