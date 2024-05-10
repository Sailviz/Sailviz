import React, { useState, useEffect } from 'react';

let fiveminsDone = false
let fourminsDone = false
let oneminsDone = false
let zerominsDone = false

let warningFlag = true

const CountdownTimer = ({ startTime, timerActive, onFiveMinutes, onFourMinutes, onOneMinute, onGo, onWarning, reset }: { startTime: number, timerActive: boolean, onFiveMinutes: any, onFourMinutes: any, onOneMinute: any, onGo: any, onWarning: any, reset: boolean }) => {
    const [timeLeft, setTimeLeft] = useState({ minutes: 5, seconds: 15, countingUp: false });


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

    //full minute signals
    if (timeLeft.minutes == 0 && timeLeft.seconds == 0 && timeLeft.countingUp == false) {
        if (!zerominsDone) {
            if (onGo) onGo();
            zerominsDone = true
            warningFlag = true
        }
    } else if (timeLeft.minutes == 1 && timeLeft.seconds == 0 && timeLeft.countingUp == false) {
        if (!oneminsDone) {
            if (onOneMinute) onOneMinute();
            oneminsDone = true
            warningFlag = true
        }
    } else if (timeLeft.minutes == 4 && timeLeft.seconds == 0 && timeLeft.countingUp == false) {
        if (!fourminsDone) {
            if (onFourMinutes) onFourMinutes();
            fourminsDone = true
            warningFlag = true
        }
    }
    else if (timeLeft.minutes == 5 && timeLeft.seconds == 0 && timeLeft.countingUp == false) {
        if (!fiveminsDone) {
            if (onFiveMinutes) onFiveMinutes();
            fiveminsDone = true
            warningFlag = true
        }
    }

    //5 second warnings
    if (timeLeft.minutes == 0 && timeLeft.seconds == 5 && timeLeft.countingUp == false) {
        if (onWarning && warningFlag) {
            onWarning();
            warningFlag = false
        }
    } else if (timeLeft.minutes == 1 && timeLeft.seconds == 5 && timeLeft.countingUp == false) {
        if (onWarning && warningFlag) {
            onWarning();
            warningFlag = false
        }
    } else if (timeLeft.minutes == 4 && timeLeft.seconds == 5 && timeLeft.countingUp == false) {
        if (onWarning && warningFlag) {
            onWarning();
            warningFlag = false
        }
    } else if (timeLeft.minutes == 5 && timeLeft.seconds == 5 && timeLeft.countingUp == false) {
        if (onWarning && warningFlag) {
            onWarning();
            warningFlag = false
        }
    }

    return (
        <>
            {`${timeLeft.countingUp ? '+' : '-'}${timeLeft.minutes.toString().padStart(2, "00")}:${timeLeft.seconds.toString().padStart(2, "00")}`}
        </>
    );
};

export default CountdownTimer;
