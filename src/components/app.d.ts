type RaceDataType = {
    id: string
    number: number
    Time: string
    Duties: DutyDataType[]
    Type: string
    fleets: FleetDataType[]
    seriesId: string
    series: SeriesDataType
}

type GlobalConfigType = {
    demoClubId: string
    demoSeriesId: string
    demoDataId: string
    demoUUID: string
}
type DutyDataType = {
    displayName: string
    name: string
}

type SeriesSettingsType = {
    numberToCount: number
    pursuitLength: number
}

type SeriesDataType = {
    id: string
    name: string
    clubId: string
    settings: SeriesSettingsType
    races: RaceDataType[]
    fleetSettings: FleetSettingsType[]
}

type FleetSettingsType = {
    id: string
    name: string
    boats: BoatDataType[]
    fleets: FleetDataType[]
}

type ResultDataType = {
    id: string
    fleetId: string
    Helm: string
    Crew: string
    boat: BoatDataType
    SailNumber: string
    finishTime: number
    numberLaps: number
    laps: LapDataType[]
    CorrectedTime: number
    PursuitPosition: number
    HandicapPosition: number
    resultCode: string
}

type StartSequenceStep = {
    id?: string // Optional for new steps
    time: number
    name: string // e.g., 'start', 'horn', 'clock'
    hoot: number
    order: number // Order of the step in the sequence
    fleetStart: string
    flagStatus: FlagStatusType[]
}

type FlagStatusType = {
    flag: string
    status: boolean
}

type LapDataType = {
    id: string
    resultId: string
    time: number
}

type NextRaceDataType = {
    id: string
    number: number
    Time: string
    series: {
        name: string
        id: string
    }
}

type RaceSettingsType = {
    numberToCount: number
}

type ClubSettingsType = {
    clockIP: string
    hornIP: string
    pursuitLength: number
    clockOffset: number
    duties: string[]
    trackable: {
        enabled: boolean
        orgID: string
    }
}

type BoatDataType = {
    id: string
    name: string
    crew: number
    py: number
    pursuitStartTime: number
    clubId: string
}

type ClubDataType = {
    id: string
    name: string
    displayName: string
    settings: ClubSettingsType
    series: SeriesDataType[]
    boats: BoatDataType[]
    stripe: Stripe
}

type Stripe = {
    customerId: string
    subscriptionId: string
    productId: string
    planName: string
    subscriptionStatus: string
    updatedAt: string
}

type UserDataType = {
    id: string
    displayUsername: string
    username: string
    admin: boolean
    roles: RoleDataType[]
    clubId: string
    startPage: string
    uuid: string
}

type RoleDataType = {
    id: string
    name: string
    clubId: string
    permissions: {
        allowed: PermissionType[]
    }
}

type PermissionType = {
    value: string
    label: string
}

type FleetDataType = {
    id: string
    raceId: string
    startTime: number
    fleetSettings: FleetSettingsType
    results: ResultDataType[]
}

type AuthedUserDataType = {
    user: UserDataType
    token: string
}

type TrackerDataType = {
    trackerID: string
    name: string
    status?: string
    details?: {
        orgID?: string
        position?: {
            lat: number
            lon: number
            timestamp?: number
        }
        battery?: number
        gps?: string
    }
}

type NavCollection = {
    title: string
    items: NavItem[]
}

type NavItem = {
    title: string
    url: string
    icon: React.ReactNode
    isActive: boolean
    shortcut: string[]
    items: NavItem[]
}
