import { orpcClient } from '@lib/orpc'
import { useQuery } from '@tanstack/react-query'
import { useLoaderData } from '@tanstack/react-router'

//ignore ts error about prisma not being available on server side
// @ts-ignore
import prisma from '@sailviz/db'

export async function isRequestAdmin() {
    const session = useLoaderData({ from: `__root__` })

    if (session?.user.admin) {
        return true
    }
    return false
}
export async function isRequestAuthorised(id: string, table: string) {
    const session = useLoaderData({ from: `__root__` })

    //bypass if admin
    if (session?.user.admin) {
        return true
    }
    //bypass if demo mode
    const GlobalConfig = useQuery(orpcClient.globalConfig.find.queryOptions()).data
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
