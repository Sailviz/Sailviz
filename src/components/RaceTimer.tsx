import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiresIn, timerActive, onFourMinutes, onOneMinute, onGo }) => {
    //these two states are completely wrong but the code works for some reason.
    const [timeLeft, setTimeLeft] = useState(expiresIn);
    const [isCountingUp, setIsCountingUp] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const tick = () => {
        if (!timerActive) return;
        if (timeLeft === 0 && !isCountingUp) {
            setIsCountingUp(true);
            if (onGo) onGo();
        } else if (timeLeft === 60) {
            if (onOneMinute) onOneMinute();
        } else if (timeLeft === 240) {
            if (onFourMinutes) onFourMinutes();
        }
        console.log(timeLeft) //nonsense
        setTimeLeft((prevTimeLeft) => (isCountingUp ? prevTimeLeft + 1 : prevTimeLeft - 1));

        setTimeoutId(setTimeout(tick, 1000));
    };

    useEffect(() => {
        if (timerActive) {
            tick();
        } else {
            clearTimeout(timeoutId);
            setTimeLeft(expiresIn);
            setIsCountingUp(false);
        }
    }, [timerActive]);

    const minutes = Math.floor(Math.abs(timeLeft) / 60);
    const seconds = Math.abs(timeLeft) % 60;

    return (
        <>
            {`${timeLeft < 0 ? '+' : '-'}${minutes}:${seconds.toString().padStart(2, '0')}`}
        </>
    );
};

export default CountdownTimer;
