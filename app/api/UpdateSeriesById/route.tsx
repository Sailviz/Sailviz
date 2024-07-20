import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

type SettingsType = {
    numberToCount: number
}

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
        return NextResponse.json({ error: true, message: "information missing" });
        return;
    }
    var series = req.series

    var updatedSeries = await updateSeries(series)
    if (updatedSeries) {
        return NextResponse.json({ error: false, series: updatedSeries });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'series not found' });
    }
}
