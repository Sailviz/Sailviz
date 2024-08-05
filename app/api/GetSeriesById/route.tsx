import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';
import { cookies } from 'next/headers';

async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
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
    return result;
}


export async function GET(request: NextRequest) {
    const cookieStore = cookies()
    const searchParams = request.nextUrl.searchParams

    var id = searchParams.get('id')

    if (id == undefined) {
        return NextResponse.json({ error: "can't find series" }, { status: 400 });
    }
    var Series = await findSeries(id)
    if (Series) {
        return NextResponse.json(Series);
    }
    else {
        return NextResponse.json({ error: "can't find series" }, { status: 406 });
    }

};