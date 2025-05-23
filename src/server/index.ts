import prisma from '@/lib/prisma'
import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http'
import { MaybePromise } from '@trpc/server/unstable-core-do-not-import'
import { IncomingMessage, ServerResponse } from 'http'
import { Session } from 'next-auth'
import { race } from 'cypress/types/bluebird'
import dayjs from 'dayjs'
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    createOrg: publicProcedure.input(z.object({ name: z.string() })).mutation(async opts => {
        const { input } = opts
    }),

    race: publicProcedure.input(z.object({ id: z.string() })).mutation(async opts => {
        const { input } = opts
        const race = await prisma.race.findUnique({
            where: {
                id: input.id
            },
            include: {
                fleets: {
                    include: {
                        results: {
                            where: {
                                isDeleted: false
                            },
                            include: {
                                boat: true,
                                laps: {
                                    where: {
                                        isDeleted: false
                                    },
                                    orderBy: {
                                        time: 'asc'
                                    }
                                }
                            }
                        },
                        fleetSettings: true
                    }
                },
                series: true
            }
        })
        return race as unknown as RaceDataType
    }),
    series: publicProcedure.input(z.object({ id: z.string() })).mutation(async opts => {
        const { input } = opts
        const series = await prisma.series.findUnique({
            where: {
                id: input.id
            },
            include: {
                races: {
                    include: {
                        fleets: {
                            include: {
                                results: {
                                    include: {
                                        boat: true
                                    }
                                }
                            }
                        }
                    }
                },
                fleetSettings: true
            }
        })
        return series as unknown as SeriesDataType
    }),
    todaysRaces: publicProcedure.input(z.object({ clubId: z.string() })).mutation(async opts => {
        const { input } = opts
        var result = await prisma.race.findMany({
            where: {
                AND: [
                    {
                        Time: {
                            gte: dayjs().set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss'),
                            lte: dayjs().set('hour', 24).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss')
                        }
                    },
                    {
                        series: {
                            clubId: input.clubId
                        }
                    }
                ]
            },
            orderBy: {
                Time: 'asc'
            },
            select: {
                id: true,
                number: true,
                Time: true,
                series: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        })
        return result
    })
})

// export type definition of API
export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
