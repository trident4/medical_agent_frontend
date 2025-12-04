"use client"

import { useEffect } from "react";
import AnalyticsChat from "@/components/chat/AnalyticsChat";
import { usePageTitle } from "@/contexts/PageTitleContext";

export default function AnalyticsPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle("Analytics Assistant");
    }, [setPageTitle]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
            <div className="flex-1 p-4">
                <AnalyticsChat />
            </div>
        </div>
    )
}
