import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

//this only updates the settings part of the club record

async function updateRole(role: RoleDataType) {
    var result = await prisma.role.update({
        where: {
            id: role.id
        },
        data: {
            name: role.name,
            permissions: role.permissions
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.role);
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
        return;
    }

    var role: RoleDataType = req.role


    var updatedRole = await updateRole(role)
    if (updatedRole) {
        return NextResponse.json({ error: false, role: updatedRole });
    } else {
        // role is not there
        return NextResponse.json({ error: true, message: 'role not found' });
    }
}
