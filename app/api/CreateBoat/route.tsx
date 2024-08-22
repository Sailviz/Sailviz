import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';

async function findBoat(name: string, clubId: string) {
    var result = await prisma.boat.findFirst({
        where: {
            AND: [
                {
                    name: name
                },
                {
                    clubId: clubId
                }
            ]
        },
    })
    return result;
}

async function createBoat(name: string, crew: number, py: number, pursuitStartTime: number, clubId: string) {
    var boat = await prisma.boat.create({
        data: {
            name: name,
            crew: crew,
            py: py,
            pursuitStartTime: pursuitStartTime,
            club: {
                connect: {
                    id: clubId
                }
            }
        },
    })
    return boat;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.name);
        assert.notStrictEqual(undefined, req.crew);
        assert.notStrictEqual(undefined, req.py);
        assert.notStrictEqual(undefined, req.clubId);
        assert.notStrictEqual(undefined, req.pursuitStartTime);

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var name = req.name
    var crew = req.crew
    var py = req.py
    var clubId = req.clubId
    var pursuitStartTime = req.pursuitStartTime

    var ExistingBoat = await findBoat(name, clubId)
    console.log(ExistingBoat)
    if (!ExistingBoat) {
        var creationResult = await createBoat(name, crew, py, pursuitStartTime, clubId)
        if (creationResult) {
            return NextResponse.json({ error: false, boat: creationResult });
        }
        else {
            return NextResponse.json({ error: true, message: 'Something went wrong crating boat' });
        }
    } else {
        return NextResponse.json({ error: true, message: 'Boat already exists' });
    }

};