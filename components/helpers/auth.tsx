const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;
import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { AVAILABLE_PERMISSIONS, userHasPermission } from 'components/helpers/users';

export async function isRequestAuthorised(cookies: NextRequest["cookies"], permission: PermissionType, id: string, table: string) {

    let token = cookies.get("token")?.value;
    let clubId = cookies.get("clubId")?.value;
    // check that required cookies are present
    if (token == undefined || clubId == undefined) {
        return false
    }

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
    if (!userHasPermission(user as UserDataType, permission)) {
        return false;
    }
    let ownData = await isRequestOwnData(id, clubId, table)
    return ownData
}

export async function isRequestOwnData(id: string, clubId: string, table: string) {
    let club;
    switch (table) {
        case "boat":
            club = await prisma.boat.findFirst({
                where: {
                    id: id
                }
            }).club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "club":
            club = await prisma.club.findFirst({
                where: {
                    id: id
                }
            })
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "race":
            club = await prisma.race.findFirst({
                where: {
                    id: id
                }
            }).series().club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "series":
            club = await prisma.series.findFirst({
                where: {
                    id: id
                }
            }).club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "user":
            club = await prisma.user.findFirst({
                where: {
                    id: id
                }
            }).club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "result":
            club = await prisma.result.findFirst({
                where: {
                    id: id
                }
            }).fleet().race().series().club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "fleet":
            club = await prisma.fleet.findFirst({
                where: {
                    id: id
                }
            }).race().series().club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "role":
            club = await prisma.role.findFirst({
                where: {
                    id: id
                }
            }).club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "fleetsettings":
            club = await prisma.fleetSettings.findFirst({
                where: {
                    id: id
                }
            }).series().club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        case "lap":
            club = await prisma.lap.findFirst({
                where: {
                    id: id
                }
            }).result().fleet().race().series().club()
            if (club?.id == clubId) {
                return true;
            }
            break;
        default:
            return false;
    }
    return false;
}