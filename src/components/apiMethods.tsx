import React from 'react';
import dayjs from 'dayjs';

export async function GetSeriesByClubId(clubId: string): Promise<SeriesDataType[]> {
    const body = {
        "clubId": clubId
    }
    return await fetch(`/api/GetSeriesByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return (data.series)
            }
        });
};

export async function GetSeriesById(id: string): Promise<SeriesDataType> {
    const body = {
        "id": id,
    }
    return await fetch(`/api/GetSeriesById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return (data.series)
            }
        });
};

export async function GetClubById(id: string): Promise<ClubDataType> {
    const body = {
        "id": id,
    }
    return await fetch(`/api/GetClubById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return (data.club)
            }
        });
};

export async function GetUserById(id: string): Promise<UserDataType> {
    const body = {
        "id": id,
    }
    return await fetch(`/api/GetUserById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return (data.user)
            }
        });
};

export async function UpdateClubById(clubData: ClubDataType): Promise<ClubDataType> {
    const body = {
        "club": clubData
    }
    console.log(body)
    return await fetch(`/api/UpdateClubById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return (data.series)
            }
        });
};

export async function getBoats(clubId: string): Promise<BoatDataType[]> {
    const body = {
        "clubId": clubId
    }
    return await fetch(`/api/GetBoats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return (data.boats)
            }
        });
};

export async function getBoatById(boatId: string): Promise<BoatDataType> {
    const body = {
        "boatId": boatId
    }
    return await fetch(`/api/GetBoatById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return (data.boat)
            }
        });
};

export async function updateRaceById(raceData: RaceDataType) {
    const body = {
        "race": raceData
    }
    return await fetch(`/api/UpdateRaceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                console.log(data)
                //TODO reload series data.
            }
        });
};

export async function getRaceById(raceId: string): Promise<RaceDataType> {
    const body = {
        "id": raceId
    }
    return await fetch(`/api/GetRaceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            return data.race
        });
};

export async function getNextRaceByClubId(clubId: string): Promise<NextRaceDataType> {
    const body = {
        "clubId": clubId
    }
    return await fetch(`/api/GetNextRaceByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            return data.race
        });
};

export async function getTodaysRaceByClubId(clubId: string): Promise<NextRaceDataType[]> {
    const body = {
        "clubId": clubId
    }
    return await fetch(`/api/GetTodaysRaceByClubId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            return data.race

        });
};

export async function updateBoatById(boatData: BoatDataType) {
    const body = {
        "boat": boatData
    }
    return await fetch(`/api/UpdateBoatById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                console.log(data)
            }
        });
};

export async function createBoat(boatName: string, crew: number, py: number, clubId: string): Promise<BoatDataType> {
    const body = {
        "name": boatName,
        "crew": crew,
        "py": py,
        "clubId": clubId
    }
    return await fetch(`/api/CreateBoat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                console.log(data)
                return data.boat
            }
        });
};

export async function deleteBoatById(id: string): Promise<BoatDataType> {
    const body = {
        "id": id,
    }
    return await fetch(`/api/DeleteBoatById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.boat
            }
        });
};

export async function updateSeries(seriesData: SeriesDataType) {
    const body = {
        "series": seriesData
    }
    return await fetch(`/api/UpdateSeriesById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                console.log(data)
            }
        });
};

export async function createRace(clubId: string, seriesId: string): Promise<RaceDataType> {
    var time = dayjs().format('YYYY-MM-DD HH:mm')
    const body = {
        "clubId": clubId,
        "seriesId": seriesId,
        "time": time
    }
    return await fetch(`/api/CreateRace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                data.race.results = [] //this adds a results list to the object
                return data.race
            }
        });
};

export async function createSeries(clubId: string, seriesName: string): Promise<SeriesDataType> {
    const body = {
        "clubId": clubId,
        "seriesName": seriesName
    }
    return await fetch(`/api/CreateSeries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.series
            }
        });
};

export async function deleteSeries(series: SeriesDataType): Promise<SeriesDataType> {
    const body = {
        "series": series
    }
    return await fetch(`/api/DeleteSeries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data
            }
        });
};

export async function deleteRace(id: string): Promise<RaceDataType> {
    const body = {
        "raceId": id,
    }
    return await fetch(`/api/DeleteRaceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
                return false
            } else {
                return data.race
            }
        });
};

export async function getClubByName(club: string): Promise<ClubDataType> {
    const body = {
        "name": club,
    }
    return await fetch(`/api/GetClubByName`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.club
            }
        });
};

export async function setBoats(clubId: string, data: BoatDataType[]): Promise<ClubDataType> {
    const body = {
        "clubId": clubId,
        "data": data
    }
    console.log(body)
    return await fetch(`/api/SetBoats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.club
            }
        });
};

export async function createResult(raceId: string, fleetId: string): Promise<ResultsDataType> {
    const body = {
        "raceId": raceId,
        "fleetId": fleetId
    }
    return await fetch(`/api/CreateResult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.result
            }
        });
};

export async function DeleteResultById(resultId: string): Promise<ResultsDataType> {
    const body = {
        "resultId": resultId,
    }
    return await fetch(`/api/DeleteResultById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.result
            }
        });
};

export async function updateResult(result: ResultsDataType): Promise<RaceDataType> {
    const body = {
        result: result,
    }
    return await fetch(`/api/UpdateResultById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body,
            (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
        ),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.race
            }
        });
};

export async function createFleet(seriesId: string): Promise<FleetDataType> {
    const body = {
        seriesId: seriesId,
    }
    return await fetch(`/api/CreateFleet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.fleet
            }
        });
};

export async function createFleetSettings(seriesId: string): Promise<FleetSettingsType> {
    const body = {
        seriesId: seriesId,
    }
    return await fetch(`/api/CreateFleetSettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.fleet
            }
        });
};

export async function GetFleetSettingsBySeries(seriesId: string): Promise<FleetSettingsType[]> {
    const body = {
        seriesId: seriesId,
    }
    return await fetch(`/api/GetFleetSettingsBySeries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
                return undefined
            } else {
                return data.fleet
            }
        });
};

export async function updateFleetById(fleet: FleetDataType): Promise<FleetDataType> {
    const body = {
        fleet: fleet,
    }
    return await fetch(`/api/UpdateFleetById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.fleet
            }
        });
};

export async function updateFleetSettingsById(fleet: FleetSettingsType): Promise<FleetSettingsType> {
    const body = {
        fleet: fleet,
    }
    return await fetch(`/api/UpdateFleetSettingsById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.fleet
            }
        });
};

export async function DeleteFleetById(fleetId: string): Promise<FleetDataType> {
    const body = {
        fleetId: fleetId,
    }
    return await fetch(`/api/DeleteFleetById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.fleet
            }
        });
};

export async function CreateLap(resultId: string, time: number): Promise<LapDataType> {
    const body = {
        resultId: resultId,
        time: time,
    }
    return await fetch(`/api/CreateLap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.fleet
            }
        });
};

export async function DeleteLapById(lapId: string): Promise<LapDataType> {
    const body = {
        id: lapId,
    }
    return await fetch(`/api/DeleteLapById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.fleet
            }
        });
};