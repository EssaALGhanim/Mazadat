import { useState, useEffect } from 'react';

export function useCountdown(endDate) {
    const calculate = () => {
        const target = new Date(endDate);
        if (Number.isNaN(target.getTime())) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }

        const diff = target.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            expired: false,
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculate);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculate()), 1000);
        return () => clearInterval(timer);
    }, [endDate]);

    return timeLeft;
}