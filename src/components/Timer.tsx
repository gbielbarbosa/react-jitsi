import { useEffect, useState } from "react";
import { useJitsiContext } from "../JitsiContext";

export interface TimerProps {
    className?: string;
    style?: React.CSSProperties;
    children?: (
        seconds: number
    ) => React.ReactNode;
}

export function Timer({ className, style, children }: TimerProps) {
    const { conferenceStart } = useJitsiContext();
    const [seconds, setSeconds] = useState<number>(0);
    useEffect(() => {
        if (!conferenceStart) return;
        setSeconds(Math.trunc((Date.now() - conferenceStart) / 1000));

        let interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [conferenceStart]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    if (!conferenceStart) return null;

    if (children) return <>{children(seconds)}</>
    return <span className={`rj-meeting-timer ${className || ''}`} style={style}>{formatTime(seconds)}</span>;
}