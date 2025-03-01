import React, { useState, useEffect } from 'react';

let hootFlag = true

let warningFlag = true

const CountdownTimer = ({ startTime, timerActive, fleetId, onFiveMinutes, onFourMinutes, onOneMinute, onGo, onWarning, reset }: { startTime: number, timerActive: boolean, fleetId: string, onFiveMinutes: any, onFourMinutes: any, onOneMinute: any, onGo: any, onWarning: any, reset: boolean }) => {
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
            const time = calculateTimeLeft()
            setTimeLeft(time);
            //full minute signals
            if (time.minutes == 0 && time.seconds == 0 && time.countingUp == false) {
                if (onGo && hootFlag) {
                    onGo(fleetId);
                    hootFlag = false
                    warningFlag = true
                }
            } else if (time.minutes == 1 && time.seconds == 0 && time.countingUp == false) {
                if (onOneMinute && hootFlag) {
                    onOneMinute();
                    hootFlag = false
                    warningFlag = true
                }
            } else if (time.minutes == 4 && time.seconds == 0 && time.countingUp == false) {
                if (onFourMinutes && hootFlag) {
                    onFourMinutes();
                    hootFlag = false
                    warningFlag = true
                }
            }
            else if (time.minutes == 5 && time.seconds == 0 && time.countingUp == false) {
                if (onFiveMinutes && hootFlag) {
                    onFiveMinutes();
                    hootFlag = false
                    warningFlag = true
                }
            }

            //5 second warnings
            if (time.minutes == 0 && time.seconds == 5 && time.countingUp == false) {
                if (onWarning && warningFlag) {
                    onWarning();
                    warningFlag = false
                    hootFlag = true
                }
            } else if (time.minutes == 1 && time.seconds == 5 && time.countingUp == false) {
                if (onWarning && warningFlag) {
                    onWarning();
                    warningFlag = false
                    hootFlag = true
                }
            } else if (time.minutes == 4 && time.seconds == 5 && time.countingUp == false) {
                if (onWarning && warningFlag) {
                    onWarning();
                    warningFlag = false
                    hootFlag = true
                }
            } else if (time.minutes == 5 && time.seconds == 5 && time.countingUp == false) {
                if (onWarning && warningFlag) {
                    onWarning();
                    warningFlag = false
                    hootFlag = true
                }
            }
        }, 100);



        return () => clearTimeout(timer);
    }, [timerActive, timeLeft, startTime]);

    useEffect(() => {
        if (reset) {
            setTimeLeft({ minutes: 5, seconds: 15, countingUp: false });
        }
    }, [reset]);



    return (
        <>
            {`${timeLeft.countingUp ? '+' : '-'}${timeLeft.minutes.toString().padStart(2, "00")}:${timeLeft.seconds.toString().padStart(2, "00")}`}
        </>
    );
};

export default CountdownTimer;
