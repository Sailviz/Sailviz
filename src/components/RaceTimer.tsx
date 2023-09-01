import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ startTime, timerActive, onFourMinutes, onOneMinute, onGo, reset }: { startTime: number, timerActive: boolean, onFourMinutes: any, onOneMinute: any, onGo: any, reset: boolean }) => {
    //these two states are completely wrong but the code works for some reason.
    const [timeLeft, setTimeLeft] = useState({ minutes: 5, seconds: 0, countingUp: false });

    const calculateTimeLeft = () => {
        let countingUp = false
        let difference = startTime - new Date().getTime()
        if (difference < 0) {
            difference = Math.abs(difference)
            countingUp = true
        }
        let time = {
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            countingUp: countingUp
        }

        return time;
    }

    useEffect(() => {
        if (!timerActive) return
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    }, [timerActive, timeLeft, startTime]);

    useEffect(() => {
        if (reset) {
            setTimeLeft(calculateTimeLeft());
        }
    }, [reset]);

    if (timeLeft.minutes == 0 && timeLeft.seconds == 0) {
        if (onGo) onGo();
    } else if (timeLeft.minutes == 1 && timeLeft.seconds == 0) {
        if (onOneMinute) onOneMinute();
    } else if (timeLeft.minutes == 4 && timeLeft.seconds == 0) {
        if (onFourMinutes) onFourMinutes();
    }

    return (
        <>
            {`${timeLeft.countingUp ? '+' : '-'}${timeLeft.minutes.toString().padStart(2, "00")}:${timeLeft.seconds.toString().padStart(2, "00")}`}
        </>
    );
};

export default CountdownTimer;
