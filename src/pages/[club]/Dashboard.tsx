import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import Dashboard from '../../components/Dashboard'

import { server } from '../../components/URL';

const Club = () => {
    const router = useRouter()
    var club  = router.query.club
    var series: any = {}

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

    const createHeader = (series: any) => {
        var li = document.createElement('li');

        var div = document.createElement('div')
        div.className = 'py-4 before:inline-block before:content-["\\25B6"] select-none before:rotate-90 '
        div.innerHTML = series.name
        div.onclick = function (){
            expandSeries(li)
        }
        li.appendChild(div)

        li.id = series.id
        
        li.className = 'list-none w-full bg-pink-400 text-lg font-extrabold text-gray-700 cursor-pointer select-none'
        

        var Bar = document.getElementById("leftBar")
        if(Bar == null) {
            return
        }
        Bar.appendChild(li);
    }
    const createChild = (race: any) => {
        var ul = document.createElement('ul');
        ul.innerHTML = '<li>' + race.number + " (" + race.dateTime + ")" + '</li>';
        
        ul.className = 'list-none select-none w-full p-4 bg-pink-300 text-lg font-extrabold text-gray-700 ' + race.seriesId
        
        var Parent = document.getElementById(race.seriesId)
        if(Parent == null) {
            return
        }
        Parent.appendChild(ul);
    }

    const generateBar = () => {
        removeChildren(document.getElementById("leftBar"))
        for(const element in series){
            createHeader(series[element ])
            for(const race in series[element].races){
                createChild(series[element].races[race])
            }
        }
    }

    const removeChildren = (parent: any) => {
        while (parent.childElementCount > 1) {
            parent.removeChild(parent.lastChild);
        }
    };

    const expandSeries = (element: any) => {
        var title = document.getElementById(element.id)
        var titleText = title?.firstElementChild
        if(titleText == null){return}
        var children = document.getElementsByClassName(element.id) as unknown as HTMLElement[] 
        for(var i = 0; i < children.length; i++){
            var child = children[i]
            if(!child){return}

            if(child.style.display == 'none'){
                child.style.display = 'block'
                titleText.classList.add('before:rotate-90')
                titleText.classList.remove('before:rotate-0')
            } else{
                child.style.display = 'none'
                titleText.classList.add('before:rotate-0')
                titleText.classList.remove('before:rotate-90')
            }
         }

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
                        Text
                    </p>
                </div>
            </div>
        </Dashboard>
  )
}

export default Club