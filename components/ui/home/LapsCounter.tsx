'use client'
import Link from 'next/link'
import useSWR from 'swr';
import * as Fetcher from 'components/Fetchers'
import { useEffect, useState } from 'react';

type CardProps = {
    name: string;
    description: string;
    link: string;
};

export default function LapsCounter() {
    const [lastData, setLastData] = useState(0)

    function increaseNumberAnimation(elementId: string, endNumber: number, speed = 1) {
        const element = document.getElementById(elementId) as HTMLElement

        if (!element) return

        incNbrRec(lastData, endNumber, element, lastData == 0 ? 1 : 100)
    }

    /*A recursive function to increase the number.*/
    function incNbrRec(currentNumber: number, endNumber: number, element: HTMLElement, speed: number) {
        if (currentNumber <= endNumber) {
            element.innerHTML = currentNumber.toString()
            setTimeout(function () {
                incNbrRec(currentNumber + 1, endNumber, element, speed)
            }, speed) //Delay a bit before calling the function again.
        }
    }


    var { data, error, isValidating } = useSWR('/api/GetGlobalLaps', Fetcher.fetcher, { refreshInterval: 10000 });
    if (data == undefined) {
        data = 0
    }

    useEffect(() => {
        if (data) {
            setLastData(data)
            increaseNumberAnimation("nbr", data)
        }
    }, [data])
    return (
        <section className="flex flex-col justify-center p-6 duration-500 border-2 border-pink-500 rounded shadow-xl motion-safe:hover:scale-105 cursor-pointer">
            <h2 className="text-2xl text-gray-700">Laps Raced:<div id='nbr'></div>

            </h2>
        </section>

    );
};