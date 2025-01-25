import { server } from './URL';
export async function getGlobalConfig(): Promise<GlobalConfigType> {
    return await fetch(`${server}/api/GlobalConfig`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(async (res) => {
            if (res.ok) {
                let data = await res.json()
                return data
            } else {
                return undefined
            }
        })
};