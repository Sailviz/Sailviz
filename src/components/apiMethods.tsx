import exp from 'constants';
import React from 'react';
import { server } from './URL';

export async function getListOfSeries(club: string) {
    const body = {
        "club": club
    }
    const res = await fetch(`${server}/api/GetSeriesByClub`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.error) {
                console.log(data.error)
            } else {
                return (data.series)
            }
        });
};