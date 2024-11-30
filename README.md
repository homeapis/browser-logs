# @homeapis/browser-logs

`@homeapis/browser-logs` is a lightweight logging utility designed for Next.js applications. It provides a robust mechanism to track logs, health checks, and analytics with minimal setup.

## Features

- **Customizable Logs**: Easily integrate custom logging for your Next.js app.
- **Health Checks**: Monitor the health of your analytics services.
- **Next.js Compatible**: Fully optimized for use with server-side rendering and client-side React.

---

## Installation

First, install the package using npm or yarn:

```bash
npm install @homeapis/browser-logs
```

or

```bash
yarn add @homeapis/browser-logs
```

> **Note**: Ensure `react` is installed as it is a peer dependency.

---

## Setup

### Step 1: Add a `analytics.config.ts` File
Create a `analytics.config.ts` file at the root of your Next.js project. This file defines your analytics configuration:

```ts
import { AnalyticsTargetConfig } from "@homeapis/browser-logs";

const config: Partial<AnalyticsTargetConfig> = {
  targetMode: "prod",
  targetEndpointUrl: "https://log-ingest.yourservice.com/api/v1/logs",
  targetHealthEndpoint: "https://log-ingest.yourservice.com/health",
  defaultServiceIdentifier: "my-nextjs-app",
};

export default config;
```

### Step 2: Wrap Your Application with the `AppMetricsProvider`
In your `_app.tsx`, wrap your application with the `AppMetricsProvider` and pass the current `pathname`:

```tsx
// _app.tsx
import { AppMetricsProvider } from "@homeapis/browser-logs";
import { usePathname } from "next/navigation"; // For Next.js 13+
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: any) {
  const pathname = usePathname(); // Get current pathname

  return (
    <AppMetricsProvider pathname={pathname} config={{}}>
      <Component {...pageProps} />
    </AppMetricsProvider>
  );
}
```

> If you use an earlier version of Next.js, you can retrieve the pathname using `useRouter()`.

### Step 3: Use the `useMetrics` Hook
Access the logging and analytics functionalities anywhere in your app using the `useMetrics` hook:

```tsx
import { useMetrics } from "@homeapis/browser-logs";

export default function ExamplePage() {
  const metrics = useMetrics();

  const logEvent = () => {
    metrics.logEvent({
      level: "INFO",
      message: "User clicked the button!",
      metadata: { buttonId: "example-button" },
    });
  };

  return (
    <div>
      <h1>Example Page</h1>
      <button onClick={logEvent}>Log Event</button>
    </div>
  );
}
```

---

## API Reference

### `AppMetricsProvider`
Wrap your React application with this provider to initialize logging.

#### Props
| Name       | Type                     | Description                                |
|------------|--------------------------|--------------------------------------------|
| `config`   | `AnalyticsTargetConfig`  | Analytics configuration object.            |
| `pathname` | `string`                 | Current pathname of the application.       |
| `children` | `React.ReactNode`        | React children to render inside the provider.|

---

### `useMetrics`
Returns the `AnalyticsTarget` instance.

#### Methods
- **`logEvent(payload: Omit<LogType, "url" | "service">): void`**
  Logs an event to the configured analytics endpoint.

---

## Configuration

`analytics.config.ts` supports the following options:

| Key                       | Type              | Default Value                                                      | Description                                    |
|---------------------------|-------------------|----------------------------------------------------------------------|------------------------------------------------|
| `targetMode`              | `"dev" | "prod"` | Required                                                           | Defines the logging mode.                     |
| `targetEndpointUrl`       | `string`          | `https://log-ingest.crocodile.eu-west-1.dev.amcdn.net/api/v1/logs`  | Endpoint for sending logs.                   |
| `targetHealthEndpoint`    | `string`          | Required                                                           | Endpoint for health checks.                  |
| `defaultServiceIdentifier`| `string`          | Required                                                           | Default service name for log events.         |

---

## Development

### Run Locally
To test the package locally, link it to your Next.js app:
1. Inside the package directory:
   ```bash
   npm link
   ```
2. Inside the Next.js app directory:
   ```bash
   npm link @homeapis/browser-logs
   ```

---

## License

This package is licensed under the MIT License. See the `LICENSE` file for details.