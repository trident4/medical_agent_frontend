"use client"

import AnalyticsChat from "@/components/chat/AnalyticsChat";

export default function AnalyticsPage() {
    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Analytics Assistant</h1>
            </div>
            <div className="flex-1">
                <AnalyticsChat />
            </div>
        </div>
    )
}
