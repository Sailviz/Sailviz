import React from 'react';
import { server } from './URL';
import dayjs from 'dayjs';

export async function fetchSeries(club: string): Promise<SeriesDataType[]> {
    const body = {
        "club": club
    }
    return await fetch(`${server}/api/GetSeriesByClub`, {
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

export async function fetchBoats(): Promise<BoatDataType[]> {
    const body = {
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

export async function updateRaceSettings(raceData: RaceDataType) {
    const body = raceData
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

export async function updateSeriesSettings(seriesData: SeriesDataType) {
    const body = seriesData
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

export async function createRace(club: string, seriesName: string): Promise<RaceDataType> {
    var time = dayjs().format('YYYY-MM-DD HH:mm')
    const body = {
        "club": club,
        "seriesName": seriesName,
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
                console.log(data.race)
                return data.race
            }
        });
};

export async function deleteRace(id: string): Promise<RaceDataType> {
    const body = {
        "id": id,
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
    return await fetch(`${server}/api/GetClub`, {
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