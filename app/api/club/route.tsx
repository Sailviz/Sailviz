import prisma from '../../../components/prisma'
import { type NextRequest } from 'next/server'

async function getClub(id: string) {
    var result = await prisma.club.findUnique({
        where: {
            id: id
        },
    })
    if (result == null) {
        return
    }
    return result;
}

export async function GET(request: NextRequest) {
    var clubId = request.cookies.get('clubId')?.value
    if (clubId == null) {
        return Response.json({ error: "information missing" }, { status: 400 });
    }
    var club = await getClub(clubId)
    if (club) {
        return Response.json(club);
    }
    else {
        return Response.json({ error: "can't find club" }, { status: 406 });
    }
};