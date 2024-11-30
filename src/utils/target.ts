/**
 * List of supported target modes
 */
const targetModes = ["dev", "prod"] as const;
type TargetMode = typeof targetModes[number];

/**
 * Log levels for pushing
 * output to the log pipeline
 */
const logLevels = ["INFO", "ALERT", "ERROR", "MESSAGE"] as const;
type LogLevel = typeof logLevels[number];

/**
 * Configuration for AnalyticsTarget
 */
interface AnalyticsTargetConfig {
    targetMode: TargetMode;
    /**
     * Defaults to `https://log-ingest.crocodile.eu-west-1.dev.amcdn.net/api/v1/logs`
     */
    targetEndpointUrl: string;
    targetHealthEndpoint: string;
    /**
     * Service Name
     */
    defaultServiceIdentifier: string;
}

/**
 * Log Type for sending to the batch processor
 */
interface LogType {
    timestamp: string;
    service: string | undefined;
    level: LogLevel;
    message: string;
    url: string | undefined;
    metadata: Record<string, any> | undefined;
}

/**
 * Input for creating log events
 */
interface LogTypeCustomVariables {
    service?: string;
    level: LogLevel;
    message: string;
    url?: string;
    metadata?: Record<string, any>;
}

/**
 * AnalyticsTarget class
 * A log management utility to send logs and perform health checks.
 */
class AnalyticsTarget {
    config: AnalyticsTargetConfig;
    logs: LogType[];
    healthCheckIntervalId: NodeJS.Timeout | null;

    constructor({
        targetMode,
        defaultServiceIdentifier,
        targetEndpointUrl = "https://log-ingest.crocodile.eu-west-1.dev.amcdn.net/api/v1/logs",
        targetHealthEndpoint,
    }: AnalyticsTargetConfig) {
        this.config = {
            targetEndpointUrl,
            targetHealthEndpoint,
            targetMode,
            defaultServiceIdentifier,
        };
        this.logs = [];
        this.healthCheckIntervalId = null; // Store the interval ID for cleanup
    }

    /**
     * Format log events in the required JSON syntax and send them to the endpoint.
     */
    logEvent({ service, url, metadata, level, message }: LogTypeCustomVariables): void {
        const timestamp = new Date().toISOString();
        const logEntry: LogType = { message, service, url, metadata, level, timestamp };
        this.logs.push(logEntry); // Keep a local record of the log

        console.log("[allogator] Event queued:", logEntry);

        // Send the log to the configured endpoint asynchronously
        this.sendLogToEndpoint(logEntry).catch((error) => {
            console.error("[allogator] Failed to send log:", error);
        });
    }

    /**
     * Asynchronous function to send a single log entry to the configured endpoint.
     */
    private async sendLogToEndpoint(logEntry: LogType): Promise<void> {
        try {
            const response = await fetch(this.config.targetEndpointUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(logEntry),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log("[allogator] Log successfully sent to endpoint.");
        } catch (error) {
            throw error; // Let the calling method handle the error
        }
    }

    /**
     * Get locally ingested logs
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Start periodic health checks
     */
    startHealthCheck() {
        if (this.healthCheckIntervalId) {
            console.warn("Health check is already running.");
            return;
        }

        const healthCheck = async () => {
            try {
                const response = await fetch(this.config.targetHealthEndpoint, { method: "GET" });
                if (!response.ok) {
                    throw new Error(`Health check failed with status: ${response.status}`);
                }
                console.log("[allogatorTarget:heartbeat] Health check passed.");
            } catch (error: any) {
                console.error("[allogatorTarget:heartbeat] Health check failed:", error.message);
            }
        };

        // Perform the health check every 15 seconds
        this.healthCheckIntervalId = setInterval(healthCheck, 15 * 1000);
        console.log("[allogatorTarget:heartbeat] Health check started.");
    }

    /**
     * Stop periodic health checks
     */
    stopHealthCheck() {
        if (this.healthCheckIntervalId) {
            clearInterval(this.healthCheckIntervalId);
            this.healthCheckIntervalId = null;
            console.log("[allogatorTarget:heartbeat] Health check stopped.");
        }
    }
}

export { AnalyticsTarget };
export type { AnalyticsTargetConfig, LogType, LogTypeCustomVariables };
