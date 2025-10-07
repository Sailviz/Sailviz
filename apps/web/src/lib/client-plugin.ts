import type { BetterAuthClientPlugin } from 'better-auth'
import { myPluginInstance } from './plugin'

export const myPluginClient = () => {
    return myPluginInstance as unknown as BetterAuthClientPlugin
}
