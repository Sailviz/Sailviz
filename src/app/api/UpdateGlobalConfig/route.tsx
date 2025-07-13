import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAdmin } from '@/components/helpers/auth'
//this only updates the settings part of the config record

async function updateConfig(config: GlobalConfigType) {
    // this is many as active column is not unique
    var result = await prisma.globalConfig.updateMany({
        where: {
            active: true
        },
        data: {
            demoClubId: config.demoClubId,
            demoSeriesId: config.demoSeriesId,
            demoDataId: config.demoDataId,
            demoUUID: config.demoUUID
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.config)
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var config: GlobalConfigType = req.config

    let authorised = await isRequestAdmin()
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var updatedConfig = await updateConfig(config)
    if (updatedConfig) {
        return NextResponse.json({ res: updatedConfig }, { status: 200 })
    }
    return NextResponse.json({ error: 'config not found' }, { status: 400 })
}
