import * as Types from '@sailviz/types'

export function getFiveStartSequence(fleetId: string, classFlag: Types.Flag, prepFlag: Types.Flag): StartSequenceStep[] {
    return [
        {
            time: 315,
            name: 'warning',
            order: 0,
            hoot: 0,
            classFlagStatus: { flag: classFlag, status: false },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: ''
        },
        {
            time: 300,
            name: '5 minutes',
            order: 1,
            hoot: 800,
            classFlagStatus: { flag: classFlag, status: true },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: ''
        },
        {
            time: 240,
            name: '4 minutes',
            order: 2,
            hoot: 800,
            classFlagStatus: { flag: classFlag, status: true },
            prepFlagStatus: { flag: prepFlag, status: true },
            fleetStart: ''
        },
        {
            time: 60,
            name: '1 minute',
            order: 3,
            hoot: 1600,
            classFlagStatus: { flag: classFlag, status: true },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: ''
        },
        {
            time: 0,
            name: 'Start',
            order: 4,
            hoot: 800,
            classFlagStatus: { flag: classFlag, status: false },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: fleetId
        }
    ]
}

export function getThreeStartSequence(fleetId: string, classFlag: Types.Flag, prepFlag: Types.Flag): StartSequenceStep[] {
    return [
        {
            time: 195,
            name: 'warning',
            order: 0,
            hoot: 0,
            classFlagStatus: { flag: classFlag, status: false },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: ''
        },
        {
            time: 180,
            name: '3 minutes',
            order: 1,
            hoot: 800,
            classFlagStatus: { flag: classFlag, status: true },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: ''
        },
        {
            time: 120,
            name: '2 minutes',
            order: 2,
            hoot: 800,
            classFlagStatus: { flag: classFlag, status: true },
            prepFlagStatus: { flag: prepFlag, status: true },
            fleetStart: ''
        },
        {
            time: 60,
            name: '1 minute',
            order: 3,
            hoot: 1600,
            classFlagStatus: { flag: classFlag, status: true },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: ''
        },
        {
            time: 0,
            name: 'Start',
            order: 4,
            hoot: 800,
            classFlagStatus: { flag: classFlag, status: false },
            prepFlagStatus: { flag: prepFlag, status: false },
            fleetStart: fleetId
        }
    ]
}

// export function getThreeStartSequence(fleetId: string, classFlag: Types.Flag, prepFlag: Types.Flag): StartSequenceStep[] {
//     return [
//         {
//             time: 75,
//             name: 'warning',
//             order: 0,
//             hoot: 0,
//             classFlagStatus: { flag: classFlag, status: false },
//             prepFlagStatus: { flag: prepFlag, status: false },
//             fleetStart: ''
//         },
//         {
//             time: 60,
//             name: '3 minutes',
//             order: 1,
//             hoot: 300,
//             classFlagStatus: { flag: classFlag, status: true },
//             prepFlagStatus: { flag: prepFlag, status: false },
//             fleetStart: ''
//         },
//         {
//             time: 40,
//             name: '2 minutes',
//             order: 2,
//             hoot: 300,
//             classFlagStatus: { flag: classFlag, status: true },
//             prepFlagStatus: { flag: prepFlag, status: true },
//             fleetStart: ''
//         },
//         {
//             time: 20,
//             name: '1 minute',
//             order: 3,
//             hoot: 500,
//             classFlagStatus: { flag: classFlag, status: true },
//             prepFlagStatus: { flag: prepFlag, status: false },
//             fleetStart: ''
//         },
//         {
//             time: 0,
//             name: 'Start',
//             order: 4,
//             hoot: 300,
//             classFlagStatus: { flag: classFlag, status: false },
//             prepFlagStatus: { flag: prepFlag, status: false },
//             fleetStart: fleetId
//         }
//     ]
// }
