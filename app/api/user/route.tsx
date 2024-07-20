import prisma from '../../../components/prisma'
import { type NextRequest } from 'next/server'

async function getUser(id: string) {
    var result = await prisma.user.findUnique({
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
    var userId = request.cookies.get('userId')?.value
    if (userId == null) {
        return Response.json({ error: "information missing" }, { status: 400 });
    }
    var user = await getUser(userId)
    if (user) {
        return Response.json(user);
    }
    else {
        return Response.json({ error: "can't find user" }, { status: 406 });
    }
};