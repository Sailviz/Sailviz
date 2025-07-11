'use client'
import React from 'react'
import dayjs from 'dayjs'
import { server } from './URL'

export async function User(): Promise<UserDataType> {
    return await fetch(`${server}/api/user`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.user
            }
        })
}

export async function AuthenticateUser(username: string, password: string): Promise<AuthedUserDataType> {
    const body = {
        username: username,
        password: password
    }
    return await fetch(`${server}/api/Authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data
            }
        })
}

export async function GetSeriesByClubId(clubId: string): Promise<SeriesDataType[]> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/GetSeriesByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.series
            }
        })
}

export async function GetSeriesById(seriesId: string): Promise<SeriesDataType> {
    return await fetch(`${server}/api/GetSeriesById?id=${seriesId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data
            }
        })
}

export async function GetClubById(id: string): Promise<ClubDataType> {
    const body = {
        id: id
    }
    return await fetch(`${server}/api/GetClubById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.club
            }
        })
}

export async function GetUserById(id: string): Promise<UserDataType> {
    const body = {
        id: id
    }
    return await fetch(`${server}/api/GetUserById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.user
            }
        })
}

export async function UpdateClubById(clubData: ClubDataType): Promise<ClubDataType> {
    const body = {
        club: clubData
    }
    console.log(body)
    return await fetch(`${server}/api/UpdateClubById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function getBoats(clubId: string): Promise<BoatDataType[]> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/GetBoats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.boats
            }
        })
}

export async function getBoatById(boatId: string): Promise<BoatDataType> {
    const body = {
        boatId: boatId
    }
    return await fetch(`${server}/api/GetBoatById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.boat
            }
        })
}

export async function updateRaceById(raceData: RaceDataType) {
    const body = {
        race: raceData
    }
    return await fetch(`${server}/api/UpdateRaceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function getRaceById(raceId: string, results: boolean = true): Promise<RaceDataType> {
    return await fetch(`${server}/api/GetRaceById?id=${raceId}&results=${results}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(async data => {
            return data
        })
}

export async function getNextRaceByClubId(clubId: string): Promise<NextRaceDataType> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/GetNextRaceByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            return data.race
        })
}

export async function GetResultById(resultId: string): Promise<ResultDataType> {
    const body = {
        id: resultId
    }
    return await fetch(`${server}/api/GetResultById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            return data.result
        })
}

export async function getTodaysRaceByClubId(clubId: string): Promise<NextRaceDataType[]> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/GetTodaysRaceByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            return data.races
        })
}

export async function updateBoatById(boatData: BoatDataType) {
    const body = {
        boat: boatData
    }
    return await fetch(`${server}/api/UpdateBoatById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function createBoat(boatName: string, crew: number, py: number, pursuitStartTime: number, clubId: string): Promise<BoatDataType> {
    const body = {
        name: boatName,
        crew: crew,
        py: py,
        pursuitStartTime: pursuitStartTime,
        clubId: clubId
    }
    return await fetch(`${server}/api/CreateBoat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function deleteBoatById(id: string): Promise<BoatDataType> {
    const body = {
        id: id
    }
    return await fetch(`${server}/api/DeleteBoatById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function updateSeries(seriesData: SeriesDataType) {
    const body = {
        series: seriesData
    }
    return await fetch(`${server}/api/UpdateSeriesById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function createRace(clubId: string, seriesId: string): Promise<RaceDataType> {
    var time = dayjs().format('YYYY-MM-DD HH:mm')
    const body = {
        clubId: clubId,
        seriesId: seriesId,
        time: time
    }
    return await fetch(`${server}/api/CreateRace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function createSeries(clubId: string, seriesName: string): Promise<SeriesDataType> {
    const body = {
        clubId: clubId,
        seriesName: seriesName
    }
    return await fetch(`${server}/api/CreateSeries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function deleteSeriesById(seriesId: string): Promise<SeriesDataType> {
    const body = {
        seriesId: seriesId
    }
    return await fetch(`${server}/api/DeleteSeriesById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function deleteRaceById(id: string): Promise<RaceDataType> {
    const body = {
        raceId: id
    }
    return await fetch(`${server}/api/DeleteRaceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function getClubByName(club: string): Promise<ClubDataType> {
    const body = {
        name: club
    }
    return await fetch(`${server}/api/GetClubByName`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.club
            }
        })
}

export async function setBoats(clubId: string, data: BoatDataType[]): Promise<ClubDataType> {
    const body = {
        clubId: clubId,
        data: data
    }
    console.log(body)
    return await fetch(`${server}/api/SetBoats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.club
            }
        })
}

export async function createResult(fleetId: string): Promise<ResultDataType> {
    const body = {
        fleetId: fleetId
    }
    return await fetch(`${server}/api/CreateResult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function DeleteResultById(result: ResultDataType): Promise<ResultDataType> {
    const body = {
        resultId: result.id
    }
    return await fetch(`${server}/api/DeleteResultById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function updateResult(result: ResultDataType): Promise<RaceDataType> {
    const body = {
        result: result
    }
    return await fetch(`${server}/api/UpdateResultById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            body,
            (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
        )
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function createFleet(seriesId: string): Promise<FleetDataType> {
    const body = {
        seriesId: seriesId
    }
    return await fetch(`${server}/api/CreateFleet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function createFleetSettings(seriesId: string): Promise<boolean> {
    const body = {
        seriesId: seriesId
    }
    return await fetch(`${server}/api/CreateFleetSettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function GetFleetSettingsBySeries(seriesId: string): Promise<FleetSettingsType[]> {
    const body = {
        seriesId: seriesId
    }
    return await fetch(`${server}/api/GetFleetSettingsBySeries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            if (data && data.error) {
                console.log(data.message)
                return undefined
            } else {
                return data.fleet
            }
        })
}

export async function updateFleetById(fleet: FleetDataType): Promise<FleetDataType> {
    const body = {
        fleet: fleet
    }
    return await fetch(`${server}/api/UpdateFleetById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function getFleetById(fleetId: string): Promise<FleetDataType> {
    return await fetch(`${server}/api/GetFleetById?id=${fleetId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data
        } else {
            return undefined
        }
    })
}

export async function updateFleetSettingsById(fleet: FleetSettingsType): Promise<FleetSettingsType> {
    const body = {
        fleet: fleet
    }
    return await fetch(`${server}/api/UpdateFleetSettingsById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function DeleteFleetSettingsById(fleetSettingsId: string): Promise<FleetDataType> {
    const body = {
        fleetSettingsId: fleetSettingsId
    }
    return await fetch(`${server}/api/DeleteFleetSettingsById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function CreateLap(resultId: string, time: number): Promise<LapDataType> {
    const body = {
        resultId: resultId,
        time: time
    }
    return await fetch(`${server}/api/CreateLap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function DeleteLapById(lapId: string): Promise<LapDataType> {
    const body = {
        id: lapId
    }
    return await fetch(`${server}/api/DeleteLapById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function GetUsersByClubId(clubId: string): Promise<UserDataType[]> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/GetUsersByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.users
            }
        })
}

export async function GetRolesByClubId(clubId: string): Promise<RoleDataType[]> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/GetRolesByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(async data => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.roles
            }
        })
}

export function hasPermission() {
    console.log('hasPermission')
}

export async function createUser(clubId: string): Promise<UserDataType> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/CreateUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function updateUser(user: UserDataType): Promise<UserDataType> {
    const body = {
        user: user
    }
    return await fetch(`${server}/api/UpdateUserById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function deleteUser(user: UserDataType): Promise<UserDataType[]> {
    const body = {
        user: user
    }
    return await fetch(`${server}/api/DeleteUserById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function createRole(clubId: string): Promise<RoleDataType> {
    const body = {
        clubId: clubId
    }
    return await fetch(`${server}/api/CreateRole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function updateRole(role: RoleDataType): Promise<RoleDataType[]> {
    const body = {
        role: role
    }
    return await fetch(`${server}/api/UpdateRoleById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function deleteRole(role: RoleDataType): Promise<RoleDataType[]> {
    const body = {
        role: role
    }
    return await fetch(`${server}/api/DeleteRoleById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.res
        } else {
            return undefined
        }
    })
}

export async function updateStartSequenceById(seriesId: string, startSequence: StartSequenceStep[]): Promise<boolean> {
    const body = {
        seriesId: seriesId,
        startSequence: startSequence
    }
    return await fetch(`${server}/api/UpdateStartSequenceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.status === 200
        } else {
            return false
        }
    })
}

export async function deleteStartSequenceById(id: string): Promise<boolean> {
    const body = {
        id: id
    }
    return await fetch(`${server}/api/DeleteStartSequenceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.status === 200
        } else {
            return false
        }
    })
}

export async function createClub(clubName: string): Promise<ClubDataType> {
    const body = {
        clubName: clubName
    }
    return await fetch(`${server}/api/CreateClub`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async res => {
        if (res.ok) {
            let data = await res.json()
            return data.Club
        } else {
            return undefined
        }
    })
}
