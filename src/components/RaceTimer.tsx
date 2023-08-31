import { useState, useEffect } from 'react';


const RaceTimer = ({ expiresIn }: { expiresIn: number }) => {
    const [min, setMin] = useState(0);
    const [sec, setSec] = useState(0);
    const [timeLeft, setTimeLeft] = useState(expiresIn);

    const formatTime = (t: number) => t < 10 ? '0' + t : t;

    useEffect(() => {
        const interval = setInterval(() => {
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft - m * 60;

            setMin(m);
            setSec(s);
            if (m <= 0 && s <= 0) return () => clearInterval(interval);

            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    return (
        <>
            <span>{formatTime(min)}</span> : <span>{formatTime(sec)}</span>
        </>
    );
}

export default RaceTimer;