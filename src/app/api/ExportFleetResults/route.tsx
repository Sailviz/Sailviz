import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

async function findFleet(fleetId: any) {
    var result = await prisma.fleet.findUnique({
        where: {
            id: fleetId
        },
        include: {
            results: {
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
            race: {
                include: {
                    series: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            fleetSettings: {
                select: {
                    name: true
                }
            }
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    // Your logic to fetch or generate the CSV data

    var id = searchParams.get('id')

    if (id == undefined) {
        return NextResponse.json({ error: "can't find fleet" }, { status: 400 })
    }

    var fleet = await findFleet(id)

    if (fleet == undefined || fleet == null) {
        return NextResponse.json({ error: "can't find fleet" }, { status: 406 })
    }

    var csvRows: string[] = []

    const csvheaders =
        fleet.race.Type == 'Handicap'
            ? ['HelmName', 'CrewName', 'Class', 'SailNo', 'Laps', 'Elapsed', 'Code']
            : ['HelmName', 'CrewName', 'Class', 'SailNo', 'Laps', 'PursuitPosition', 'Code']

    csvRows.push(csvheaders.join(','))

    fleet.results.forEach(result => {
        if (fleet == undefined || result.boat == undefined) return
        var time = new Date((result.finishTime - fleet.startTime) * 1000).toISOString().substring(11, 19)
        var values =
            fleet.race.Type == 'Handicap'
                ? [result.Helm, result.Crew, result.boat.name, result.SailNumber, result.laps.length, result.finishTime == -1 ? '' : time, result.resultCode]
                : [result.Helm, result.Crew, result.boat.name, result.SailNumber, result.laps.length, result.PursuitPosition, result.resultCode]
        //join values with comma
        csvRows.push(values.join(','))
    })

    let data = csvRows.join('\n')

    // Creating a Blob for having a csv file format
    // and passing the data with type
    const blob = new Blob([data], { type: 'text/csv' })

    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="${fleet.race.series.name}-${fleet.race.number}-${fleet.fleetSettings.name}_Results.csv"`)
    return new NextResponse(blob, { status: 200, statusText: 'OK', headers })
}
