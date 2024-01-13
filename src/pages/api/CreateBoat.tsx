import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findBoat(name: string, clubId: string) {
    var result = await prisma.boats.findFirst({
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

async function createBoat(name: string, crew: number, py: number, clubId: string) {
    var boat = await prisma.boats.create({
        data: {
            name: name,
            crew: crew,
            py: py,
            pursuitStartTime: 0,
            club: {
                connect: {
                    id: clubId
                }
            }
        },
    })
    return boat;
}

const CreateBoat = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops empty fields, this stops missing fields
        try {
            assert.notStrictEqual(undefined, req.body.name);
            assert.notStrictEqual(undefined, req.body.crew);
            assert.notStrictEqual(undefined, req.body.py);
            assert.notStrictEqual(undefined, req.body.clubId);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var name = req.body.name
        var crew = req.body.crew
        var py = req.body.py
        var clubId = req.body.clubId

        var ExistingBoat = await findBoat(name, clubId)
        console.log(ExistingBoat)
        if (!ExistingBoat) {
            var creationResult = await createBoat(name, crew, py, clubId)
            if (creationResult) {
                res.json({ error: false, boat: creationResult });
                return;
            }
            else {
                res.json({ error: true, message: 'Something went wrong crating boat' });
            }
        } else {
            res.json({ error: true, message: 'Boat already exists' });
            return;
        }
    }
};

export default CreateBoat