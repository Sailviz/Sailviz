import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

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
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    let authorised = await isRequestAuthorised(request.cookies.get("token")!.value, AVAILABLE_PERMISSIONS.editRoles)
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var role: RoleDataType = req.role

    var updatedRole = await updateRole(role)
    if (updatedRole) {
        return NextResponse.json({ res: updatedRole }, { status: 200 });
    }
    return NextResponse.json({ error: 'role not found' }, { status: 400 });
}
