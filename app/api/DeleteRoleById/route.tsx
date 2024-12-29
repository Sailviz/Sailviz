import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

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
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    let authorised = await isRequestAuthorised(request.cookies.get("token")!.value, AVAILABLE_PERMISSIONS.editRoles)
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var role = req.role

    var deletedRole = await findRole(role)
    if (deletedRole) {
        await deleteRole(role)
        return NextResponse.json({ res: deletedRole }, { status: 200 });
    }
    return NextResponse.json({ error: 'role not found' }, { status: 400 });
}

