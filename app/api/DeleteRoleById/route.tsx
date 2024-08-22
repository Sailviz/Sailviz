import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findRole(role: RoleDataType) {
    var result = await prisma.role.findFirst({
        where: {
            id: role.id
        },
    })
    return result;
}

async function deleteRole(role: RoleDataType) {
    var res = await prisma.role.delete({
        where: {
            id: role.id,
        }
    })
    return res;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.role, 'role required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var role = req.role
    console.log("this")
    console.log(role)

    var deletedRole = await findRole(role)
    if (deletedRole) {
        await deleteRole(role)
        return NextResponse.json({ error: false, role: deletedRole });
    } else {
        // Role exists
        return NextResponse.json({ error: true, message: 'role not found' });
    }
}

