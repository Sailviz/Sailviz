import { myPluginInstance } from '@/lib/plugin'

function toNextResponse(handler: any) {
    return async (req: Request) => {
        let body = undefined
        if (req.method !== 'GET') {
            try {
                body = await req.json()
            } catch {
                body = undefined
            }
        }
        const ctx = { req, body }
        const result = await handler(ctx)
        if (result instanceof Response) return result
        return Response.json(result)
    }
}

export const POST = toNextResponse(myPluginInstance.endpoints.authByUUID)
