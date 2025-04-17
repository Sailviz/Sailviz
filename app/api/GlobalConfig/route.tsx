import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'

async function getConfig() {
    var result = await prisma.globalConfig.findFirst({
        where: {
            active: true
        }
    })
    if (result == null) {
        return
    }
    return result
}

export async function GET(request: NextRequest) {
    let config = await getConfig()
    if (config) {
        return NextResponse.json(config)
    } else {
        return NextResponse.json({ error: "can't find config" }, { status: 406 })
    }
}
