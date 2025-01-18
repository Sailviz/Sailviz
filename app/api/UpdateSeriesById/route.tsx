import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

async function updateSeries(series: SeriesDataType) {
    var result = await prisma.series.update({
        where: {
            id: series.id
        },
        data: {
            settings: series.settings,
            name: series.name
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.series);

    } catch (bodyError) {
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    var series = req.series

    let authorised = await isRequestAuthorised(request.cookies, AVAILABLE_PERMISSIONS.editSeries, series.id, "series")
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var updatedSeries = await updateSeries(series)
    if (updatedSeries) {
        return NextResponse.json({ res: updatedSeries }, { status: 200 });
    }
    return NextResponse.json({ error: 'series not found' }, { status: 400 });
}
