"use client"

import React, { useState, useLayoutEffect, MouseEvent } from "react"

export const Ripple = () => {
    const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([])

    useLayoutEffect(() => {
        const timeoutIds: NodeJS.Timeout[] = []
        if (ripples.length > 0) {
            const lastRipple = ripples[ripples.length - 1]
            // Matches animation duration in globals.css (600ms)
            const id = setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== lastRipple.id))
            }, 600)
            timeoutIds.push(id)
        }
        return () => timeoutIds.forEach(clearTimeout)
    }, [ripples])

    const addRipple = (event: MouseEvent) => {
        const container = event.currentTarget.getBoundingClientRect()
        const size = Math.max(container.width, container.height)
        const x = event.clientX - container.left - size / 2
        const y = event.clientY - container.top - size / 2
        const newRipple = { x, y, size, id: Date.now() }
        setRipples((prev) => [...prev, newRipple])
    }

    return (
        <div
            onMouseDown={addRipple}
            className="absolute inset-0 overflow-hidden rounded-[inherit] z-0"
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute bg-current opacity-20 rounded-full animate-ripple pointer-events-none"
                    style={{
                        top: ripple.y,
                        left: ripple.x,
                        width: ripple.size,
                        height: ripple.size,
                        transform: "scale(0)",
                    }}
                />
            ))}
        </div>
    )
}
