import React from 'react';
import { server } from './URL';
import dayjs from 'dayjs';

export async function GetSeriesByClubId(clubId: string): Promise<SeriesDataType[]> {
    const body = {
        "clubId": clubId
    }
    return await fetch(`${server}/api/GetSeriesByClubId`, {
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
    console.log(body)
    return await fetch(`${server}/api/GetSeriesById`, {
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

export async function GetClubById(id: string): Promise<SeriesDataType> {
    const body = {
        "id": id,
    }
    return await fetch(`${server}/api/GetClubById`, {
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

export async function UpdateClubById(id: string, settings: SettingsType): Promise<SeriesDataType> {
    const body = {
        "id": id,
        "settings": settings
    }
    console.log(body)
    return await fetch(`${server}/api/UpdateClubById`, {
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
    return await fetch(`${server}/api/GetBoats`, {
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
    return await fetch(`${server}/api/GetBoatById`, {
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
    return await fetch(`${server}/api/UpdateRaceById`, {
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

export async function getRaceById(raceId: string) {
    const body = {
        "id": raceId
    }
    return await fetch(`${server}/api/GetRaceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then(async (data) => {
            return data
        });
};

export async function updateBoatById(boatData: BoatDataType) {
    const body = {
        "boat": boatData
    }
    return await fetch(`${server}/api/UpdateBoatById`, {
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
    return await fetch(`${server}/api/CreateBoat`, {
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
    return await fetch(`${server}/api/DeleteBoatById`, {
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

export async function updateSeriesSettings(seriesData: SeriesDataType) {
    const body = {
        "series": seriesData
    }
    return await fetch(`${server}/api/UpdateSeriesById`, {
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
    return await fetch(`${server}/api/CreateRace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

export async function createSeries(clubId: string, seriesName: string): Promise<SeriesDataType> {
    const body = {
        "clubId": clubId,
        "seriesName": seriesName
    }
    return await fetch(`${server}/api/CreateSeries`, {
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

export async function deleteSeries(seriesId: string): Promise<SeriesDataType> {
    const body = {
        "seriesId": seriesId
    }
    return await fetch(`${server}/api/DeleteSeriesById`, {
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

export async function deleteRace(id: string): Promise<RaceDataType> {
    const body = {
        "raceId": id,
    }
    return await fetch(`${server}/api/DeleteRaceById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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



export async function getRYAPY(): Promise<BoatDataType[]> {

    return await fetch(`${server}/api/GetRYAPY`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data && data.error) {
                console.log(data.message)
            } else {
                return data.boats
            }
        });
};

export async function getClub(club: string): Promise<ClubDataType> {
    const body = {
        "name": club,
    }
    return await fetch(`${server}/api/GetClubByName`, {
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
    return await fetch(`${server}/api/SetBoats`, {
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

export async function createRaceEntry(raceId: string): Promise<ResultsDataType> {
    const body = {
        "raceId": raceId,
    }
    return await fetch(`${server}/api/CreateRaceEntry`, {
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
    return await fetch(`${server}/api/DeleteResultById`, {
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

export async function updateResultById(result: ResultsDataType): Promise<RaceDataType> {
    const body = {
        result: result,
    }
    return await fetch(`${server}/api/UpdateResultById`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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