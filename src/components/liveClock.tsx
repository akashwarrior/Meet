'use client';

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function LiveClock() {
    const [time, setTime] = useState<Date | null>(null); // Cannot initialize here -[Hydration Issue]

    useEffect(() => {
        if (!time) {
            setTime(new Date())
        }
        const secondsLeft = 60 - new Date().getSeconds();
        const updateInterval = (secondsLeft * 1000);

        const interval = setTimeout(() => setTime(new Date()), updateInterval);

        return () => {
            clearTimeout(interval)
        };
    }, [time]);

    return time && (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex items-center gap-1 text-muted-foreground"
        >
            {time.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit" })}
            <span className="hidden md:inline">
                {" • "}
                {time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </span>
        </motion.div>
    );
}