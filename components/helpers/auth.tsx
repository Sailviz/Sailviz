const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;
import prisma from 'components/prisma'
import { NextResponse } from 'next/server'
import { AVAILABLE_PERMISSIONS, userHasPermission } from 'components/helpers/users';

export async function isRequestAuthorised(token: string, permission: PermissionType) {
    let decoded: any;
    if (token) {
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (e) {
            return false;
        }
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id
        },
        include: {
            roles: true
        },
        omit: {
            password: true
        }
    })
    if (user == undefined) {
        return false;
    }
    if (!userHasPermission(user as UserDataType, AVAILABLE_PERMISSIONS.editBoats)) {
        return false;
    }
    return true;
}