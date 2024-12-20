"use client";

import React, { useContext, createContext, useEffect, useState } from "react";
import { AnalyticsTarget, AnalyticsTargetConfig, LogType } from "../utils/target";

// Create the context to pass analytics to the app
const MetricsContext = createContext<AnalyticsTarget | null>(null);

interface MetricsProviderProps {
    children: React.ReactNode;
    pathname: string; // Pass the current pathname
    config: AnalyticsTargetConfig;
}

export default function AppMetricsProvider({ pathname, config, children }: MetricsProviderProps) {
    const [analytics, setAnalytics] = useState<AnalyticsTarget | null>(null);

    useEffect(() => {
        let analyticsInstance: AnalyticsTarget;
    
        const initAnalytics = async () => {
            // Initialize the analytics instance only once
            analyticsInstance = new AnalyticsTarget(config);
    
            // Start health checks
            analyticsInstance.startHealthCheck();
    
            // Set the analytics instance in state
            setAnalytics(analyticsInstance);
        };
    
        initAnalytics();
    
        // Cleanup on unmount
        return () => {
            if (analyticsInstance) {
                analyticsInstance.stopHealthCheck();
            }
        };
    }, []); // Dependency array ensures this runs only once
    
    if (!analytics) return null; // Optionally, show a loading spinner here

    // Create the enhanced analytics object with the logEvent function
    const logEventWithPath = (logPayload: Omit<LogType, "url" | "service">) => {
        analytics.logEvent({
            ...logPayload,
            service: analytics.config.defaultServiceIdentifier, // Using config from the analytics instance
            url: new URL(pathname, process.env.NEXT_PUBLIC_URL).toString(), // Appending the current pathname
        });
    };

    // Enhance the analytics instance with the new logEvent method
    const enhancedAnalytics = { ...analytics, logEvent: logEventWithPath } as AnalyticsTarget;

    // Provide the enhanced analytics instance to the app via context
    return (
        <MetricsContext.Provider value={enhancedAnalytics}>
            {children}
        </MetricsContext.Provider>
    );
}

// Custom hook to use the metrics context and access analytics instance
export const useMetrics = (): AnalyticsTarget => {
    const context = useContext(MetricsContext);
    if (!context) {
        throw new Error("useMetrics must be used within an AppMetricsProvider");
    }
    return context;
};
