// Export the provider and hook
export { default as MetricsProvider, useMetrics } from "./context/MetricsProvider";

// Export AnalyticsTarget and its related types
export { AnalyticsTarget } from "./utils/target";
export type {
    AnalyticsTargetConfig,
    LogType,
    LogTypeCustomVariables,
} from "./utils/target";
