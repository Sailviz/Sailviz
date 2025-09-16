export function getFiveStartSequence(fleetId: string) {
    return [
        {
            time: 315,
            name: 'warning',
            order: 0,
            hoot: 0,
            flagStatus: [
                { flag: 'h', status: false },
                { flag: 'p', status: false }
            ],
            fleetStart: ''
        },
        {
            time: 300,
            name: '5 minutes',
            order: 1,
            hoot: 300,
            flagStatus: [
                { flag: 'h', status: true },
                { flag: 'p', status: false }
            ],
            fleetStart: ''
        },
        {
            time: 240,
            name: '4 minutes',
            order: 2,
            hoot: 300,
            flagStatus: [
                { flag: 'h', status: true },
                { flag: 'p', status: true }
            ],
            fleetStart: ''
        },
        {
            time: 60,
            name: '1 minute',
            order: 3,
            hoot: 500,
            flagStatus: [
                { flag: 'h', status: true },
                { flag: 'p', status: false }
            ],
            fleetStart: ''
        },
        {
            time: 0,
            name: 'Start',
            order: 4,
            hoot: 300,
            flagStatus: [
                { flag: 'h', status: false },
                { flag: 'p', status: false }
            ],
            fleetStart: fleetId
        }
    ]
}

export function getThreeStartSequence(fleetId: string) {
    return [
        {
            time: 195,
            name: 'warning',
            order: 0,
            hoot: 0,
            flagStatus: [
                { flag: 'h', status: false },
                { flag: 'p', status: false }
            ],
            fleetStart: ''
        },
        {
            time: 180,
            name: '3 minutes',
            order: 1,
            hoot: 300,
            flagStatus: [
                { flag: 'h', status: true },
                { flag: 'p', status: false }
            ],
            fleetStart: ''
        },
        {
            time: 120,
            name: '2 minutes',
            order: 2,
            hoot: 300,
            flagStatus: [
                { flag: 'h', status: true },
                { flag: 'p', status: true }
            ],
            fleetStart: ''
        },
        {
            time: 60,
            name: '1 minute',
            order: 3,
            hoot: 500,
            flagStatus: [
                { flag: 'h', status: true },
                { flag: 'p', status: false }
            ],
            fleetStart: ''
        },
        {
            time: 0,
            name: 'Start',
            order: 4,
            hoot: 300,
            flagStatus: [
                { flag: 'h', status: false },
                { flag: 'p', status: false }
            ],
            fleetStart: fleetId
        }
    ]
}
