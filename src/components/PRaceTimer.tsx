import { time } from 'console';
import React, { useState, useEffect } from 'react';

let lastTime = { minutes: 0, seconds: 0, countingUp: false }

const CountdownTimer = ({ startTime, endTime, timerActive, onFourMinutes, onOneMinute, onGo, onEnd, onTimeUpdate, reset }: { startTime: number, endTime: number | null, timerActive: boolean, onFourMinutes: any, onOneMinute: any, onGo: any, onEnd: any, onTimeUpdate: any, reset: boolean }) => {
    //these two states are completely wrong but the code works for some reason.
    const [timeLeft, setTimeLeft] = useState({ minutes: 5, seconds: 0, countingUp: false });


    const calculateTimeLeft = () => {
        let countingUp = false
        let difference = startTime - (new Date().getTime() / 1000)
        if (difference < 0) {
            difference = Math.abs(difference)
            countingUp = true
        }
        let time = {
            minutes: Math.floor((difference / 60)),
            seconds: Math.floor((difference) % 60),
            countingUp: countingUp
        }

        return time;
    }

    useEffect(() => {
        if (!timerActive) return
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 100);

        return () => clearTimeout(timer);
    }, [timerActive, timeLeft, startTime]);

    useEffect(() => {
        if (reset) {
            setTimeLeft(calculateTimeLeft());
        }
    }, [reset]);


    if (JSON.stringify(lastTime) != JSON.stringify(timeLeft)) {
        //this statement runs if the time has advanced 1 second. difference check ^^
        if (onTimeUpdate) {
            onTimeUpdate(timeLeft)
            lastTime = timeLeft
        }

        if (timeLeft.minutes == 0 && timeLeft.seconds == 0 && timeLeft.countingUp == false) {
            if (onGo) onGo();
        } else if (timeLeft.minutes == 1 && timeLeft.seconds == 0 && timeLeft.countingUp == false) {
            if (onOneMinute) onOneMinute();
        } else if (timeLeft.minutes == 4 && timeLeft.seconds == 0 && timeLeft.countingUp == false) {
            if (onFourMinutes) onFourMinutes();
        } else if (endTime != null && timeLeft.minutes == endTime && timeLeft.seconds == 0 && timeLeft.countingUp == true) {
            if (onEnd) onEnd();
        }
    }


    return (
        <>
            {`${timeLeft.countingUp ? '+' : '-'}${timeLeft.minutes.toString().padStart(2, "00")}:${timeLeft.seconds.toString().padStart(2, "00")}`}
        </>
    );
};

export default CountdownTimer;
