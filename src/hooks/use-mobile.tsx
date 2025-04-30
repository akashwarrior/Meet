"use client"

import { useState, useEffect } from "react"

export function useMobile({ width = 768 }: { width?: number } = {}) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < width)
        }

        // Initial check
        checkIfMobile()

        // Add event listener
        window.addEventListener("resize", checkIfMobile)

        // Clean up
        return () => window.removeEventListener("resize", checkIfMobile)
    }, [width])

    return isMobile
}