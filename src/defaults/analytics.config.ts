import { AnalyticsTargetConfig } from "../utils/target";

const defaultAnalyticsConfig: AnalyticsTargetConfig = {
    targetMode: "dev", // Default to production
    targetEndpointUrl: "https://log-ingest.crocodile.eu-west-1.dev.amcdn.net/api/v1/logs",
    targetHealthEndpoint: "https://log-ingest.crocodile.eu-west-1.dev.amcdn.net/api/v1/health-check",
    defaultServiceIdentifier: "unknown-service",
};

export default defaultAnalyticsConfig;