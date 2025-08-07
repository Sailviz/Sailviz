const jwt = require('jsonwebtoken')
const jwtSecret = process.env.jwtSecret
import prisma from '@/lib/prisma'
import * as Fetcher from '@/components/Fetchers'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function isRequestAdmin() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (session?.user.admin) {
        return true
    }
    return false
}
export async function isRequestAuthorised(id: string, table: string) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    //bypass if admin
    if (session?.user.admin) {
        return true
    }
    //bypass if demo mode
    const GlobalConfig = await prisma.globalConfig.findFirst({
        where: {
            active: true
        }
    })
    const demo = await isRequestOwnData(id, GlobalConfig!.demoClubId, table)
    if (demo) {
        return true
    }

    var clubId = session?.user.clubId
    if (clubId == null) {
        return false
    }

    return await isRequestOwnData(id, clubId, table)
}

export async function isRequestOwnData(id: string, clubId: string, table: string) {
    let club
    switch (table) {
        case 'startSequence':
            club = await prisma.startSequence
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .series()
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'boat':
            club = await prisma.boat
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'club':
            club = await prisma.club.findFirst({
                where: {
                    id: id
                }
            })
            if (club?.id == clubId) {
                return true
            }
            break
        case 'race':
            club = await prisma.race
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .series()
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'series':
            club = await prisma.series
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'user':
            club = await prisma.user
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'result':
            club = await prisma.result
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .fleet()
                .race()
                .series()
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'fleet':
            club = await prisma.fleet
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .race()
                .series()
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'role':
            club = await prisma.role
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'fleetsettings':
            club = await prisma.fleetSettings
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .series()
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        case 'lap':
            club = await prisma.lap
                .findFirst({
                    where: {
                        id: id
                    }
                })
                .result()
                .fleet()
                .race()
                .series()
                .club()
            if (club?.id == clubId) {
                return true
            }
            break
        default:
            return false
    }
    return false
}
