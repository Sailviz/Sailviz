import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import Dashboard from '../../components/Dashboard'

import { server } from '../../components/URL';

const Club = () => {
    const router = useRouter()
    var club  = router.query.club
    var series = {}

    const getRaces = async () => {
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
                console.log(data.series)
                series = data.series
                generateBar()
            }
        });
    };

    const createHeader = (series) => {
        var div = document.createElement('div');
        div.innerHTML = '<h3>' + series.name + '</h3>';
        
        div.className = 'w-full p-4 bg-pink-400 text-lg font-extrabold text-gray-700'
        
        var Bar = document.getElementById("leftBar")
        if(Bar == null) {
            return
        }
        Bar.appendChild(div);
    }
    const createChild = (race) => {
        var div = document.createElement('div');
        div.innerHTML = '<h3>' + race.number + " (" + race.dateTime + ")" + '</h3>';
        
        div.className = 'w-full p-4 bg-pink-300 text-lg font-extrabold text-gray-700'
        
        var Bar = document.getElementById("leftBar")
        if(Bar == null) {
            return
        }
        Bar.appendChild(div);
    }

    const generateBar = () => {
        removeChildren(document.getElementById("leftBar"))
        for(const element in series){
            console.log(series[element])
            createHeader(series[element])
            for(const race in series[element].races){
                console.log(series[element].races[race])
                createChild(series[element].races[race])
            }
        }
    }

    const removeChildren = (parent: any) => {
        while (parent.childElementCount > 1) {
            parent.removeChild(parent.lastChild);
        }
    };

    const expandSeries = () => {
        console.log("expand")
    }

    const showSettings = () => {
        console.log("settings")
    }

    useEffect(() => {
        if(club !== undefined){
            const fetchRaces = async () => {
                await getRaces()
            }
            fetchRaces()

            //now I need to transfer this data into the page


        }
    },[club])

    return (
        <Dashboard>
            <div className="w-full flex flex-row items-center justify-start h-full">
                <div id="leftBar" className='flex basis-3/12 flex-col justify-start h-full border-pink-500 border-r-2'>
                    <div className='w-full flex' onClick={showSettings}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700'>
                            <p>Club Settings</p>
                        </div>
                    </div>
                </div>
                <div id="page" className='flex basis-9/12'>
                    <p className="text-6xl font-extrabold text-gray-700 p-6">
                        Open a page to view settings.
                    </p>
                </div>
            </div>
        </Dashboard>
  )
}

export default Club