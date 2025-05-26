import prisma from '@/lib/prisma'
import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import dayjs from 'dayjs'
import { createResult, updateResult } from '@/components/apiMethods'

const boatSchema = z.object({
    id: z.string(),
    name: z.string(),
    clubId: z.string()
})

const resultSchema = z.object({
    id: z.string(),
    SailNumber: z.string(),
    CorrectedTime: z.number(),
    Crew: z.string(),
    Helm: z.string(),
    finishTime: z.number(),
    resultCode: z.string(),
    PursuitPosition: z.number(),
    HandicapPosition: z.number(),
    fleetId: z.string(),
    numberLaps: z.number(),
    boat: boatSchema
})

export const appRouter = createTRPCRouter({
    createOrg: publicProcedure.input(z.object({ name: z.string() })).mutation(async opts => {
        const { input } = opts
    }),

    race: publicProcedure.input(z.object({ id: z.string() })).query(async opts => {
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
    series: publicProcedure.input(z.object({ id: z.string() })).query(async opts => {
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
    }),
    races: publicProcedure.input(z.object({ clubId: z.string(), page: z.number(), date: z.date(), historical: z.boolean() })).query(async opts => {
        const { input } = opts
        const page = input.page || 1
        const date = dayjs(input.date).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss')

        const historical = input.historical || false

        var series = await prisma.series.findMany({
            where: {
                clubId: input.clubId
            }
        })

        var races = await prisma.race.findMany({
            skip: (input.page - 1) * 10,
            take: 10,
            where: {
                seriesId: {
                    in: series.map(s => s.id)
                },
                ...(historical ? { Time: { lte: date } } : { Time: { gte: date } })
            },
            include: {
                series: true
            },
            orderBy: {
                Time: historical ? 'desc' : 'asc'
            }
        })

        var count = await prisma.race.count({
            where: {
                seriesId: {
                    in: series.map(s => s.id)
                },
                ...(historical ? { Time: { lte: date } } : { Time: { gte: date } })
            }
        })
        return { races: races as RaceDataType[], count: count }
    }),
    boats: publicProcedure.input(z.object({ clubId: z.string() })).query(async opts => {
        const { input } = opts
        const boats = await prisma.boat.findMany({
            where: {
                clubId: input.clubId
            },
            orderBy: {
                name: 'asc'
            }
        })
        return boats as BoatDataType[]
    }),
    createResult: protectedProcedure.input(z.object({ fleetId: z.string() })).mutation(async opts => {
        const { input, ctx } = opts
        if (!ctx.session) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to create a result.' })
        }
        const result = await prisma.result.create({
            data: {
                Helm: '',
                Crew: '',
                SailNumber: '',
                finishTime: 0,
                CorrectedTime: 0,
                PursuitPosition: 0,
                HandicapPosition: 0,
                isDeleted: false,
                fleet: {
                    connect: {
                        id: input.fleetId
                    }
                },
                numberLaps: 0,
                resultCode: ''
            },
            include: {
                laps: true,
                boat: true
            }
        })
        if (!result) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create result.' })
        }
        return result as unknown as ResultsDataType
    }),
    updateResult: protectedProcedure.input(z.object({ result: resultSchema })).mutation(async opts => {
        const { input, ctx } = opts
        const result = input.result
        if (!ctx.session) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to update a result.' })
        }
        const res = await prisma.result.update({
            where: {
                id: result.id
            },
            data: {
                SailNumber: result.SailNumber,
                CorrectedTime: result.CorrectedTime,
                Crew: result.Crew,
                Helm: result.Helm,
                finishTime: result.finishTime,
                resultCode: result.resultCode,
                PursuitPosition: result.PursuitPosition,
                HandicapPosition: result.HandicapPosition,
                fleetId: result.fleetId,
                numberLaps: result.numberLaps,
                boatId: result.boat.id
            },
            include: {
                laps: true,
                boat: true
            }
        })
        if (!result) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update result.' })
        }
        return res as unknown as ResultsDataType
    })
})

// export type definition of API
export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
