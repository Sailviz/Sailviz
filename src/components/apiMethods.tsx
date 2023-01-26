import exp from 'constants';
import React from 'react';
import { server } from './URL';

type RaceDataType = {
    [key: string]: any,
    id: string,
    number: number,
    OOD: string,
    AOD: string,
    SO: string,
    ASO: string,
    results: ResultsType[],
    Time: string,
    Type: string,
    seriesId: string
};

type SeriesDataType = {
    [key: string]: any,
    id: string,
    name: string,
    clubId: string,
    settings: SettingsType,
    races: RaceDataType[]
}

type ResultsType = {
    [key: string]: any,
    Helm: string,
    Crew: string,
    BoatClass: string,
    BoatNumber: string,
    Time: number,
    Laps: number,
    Position: number
}

type SettingsType = {
    [key: string]: any,
    numberToCount: number
}

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
                console.log(data.error)
            } else {
                console.log(data.series)
                return (data.series)
            }
        });
};