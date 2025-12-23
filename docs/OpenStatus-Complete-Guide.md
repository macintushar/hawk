# OpenStatus: Complete Architectural & Technical Deep Dive

OpenStatus is an open-source synthetic monitoring platform designed for high performance, distributed monitoring, and sub-second analytics. This document provides a comprehensive end-to-end explanation of how the system is built, its monorepo structure, and the lifecycle of a monitor check, integrating architectural deep dives with detailed user flow analysis.

---

## 1. System Overview & Monorepo Structure

OpenStatus follows a monorepo architecture orchestrated by **Turborepo** and **pnpm**. The project is split into deployable services (`apps/`) and shared libraries (`packages/`).

### Core Services (`apps/`)

- **`dashboard/`**: The main user interface (Next.js/React/Tailwind) where users configure monitors, view analytics, and manage teams.
- **`status-page/`**: Public-facing Next.js status pages that display service health, incident history, and uptime metrics (supports custom domains).
- **`server/`**: The central Hono/Bun REST API gateway. It handles authentication, data retrieval from LibSQL/Tinybird, and core business logic.
- **`workflows/`**: The background engine for scheduling checks, processing alerts, and managing incident transitions. Powered by Hono and QStash.
- **`checker/`**: The core Go monitoring agent. It executes HTTP, TCP, and DNS checks from various geographic regions.
- **`private-location/`**: A specialized Go agent for monitoring internal/private networks, communicating with the main platform via **ConnectRPC**.
- **`web/`**: The marketing landing page and sign-up flow (`openstatus.dev`), built with Next.js.
- **`screenshot-service/`**: A Node.js/Playwright service used to capture visual snapshots of monitored endpoints.
- **`ssh-server/`**: A specialized Go server for handling SSH-based monitoring connections.
- **`railway-proxy/`**: A proxy service used for routing or authentication in Railway deployment environments.
- **`docs/`**: The documentation site, built with Astro.

### Shared Libraries (`packages/`)

- **`db/`**: Centralized schema (Drizzle ORM), migrations, and client logic for **LibSQL/Turso**.
- **`tinybird/`**: Configuration and SQL pipe definitions for **Tinybird** (ClickHouse) analytics.
- **`notifications/`**: Multi-channel adapter for Discord, Slack, PagerDuty, Email (React Email), Webhooks, etc.
- **`assertions/`**: Shared logic for validating check results (e.g., status codes, body content).
- **`proto/`**: Protocol Buffer definitions for type-safe gRPC/ConnectRPC communication.
- **`ui/`**: A shared UI component library based on Shadcn UI and Tailwind.
- **`regions/`**: Canonical definitions of geographic monitoring regions.
- **`utils/`, `error/`, `api/`, `tsconfig/`**: Shared utilities, standardized error handling, and configuration.

---

## 2. Infrastructure & Data Layer

### Relational Database (`packages/db`)
- **Engine**: LibSQL (local or Turso cloud).
- **Role**: Stores persistent configuration (monitors, users, workspaces, incident metadata). This is the "System of Record."

### Time-Series Metrics (`packages/tinybird`)
- **Engine**: Tinybird (managed ClickHouse).
- **Role**: Stores millions of raw "pings." Every check result is ingested here for historical tracking.
- **Analytics**: Uses Tinybird Pipes to provide aggregated data for latency charts and uptime calculations without taxing the relational DB.

### Background Queue & Caching
- **Redis (Upstash)**: Used for rate limiting and deduplication.
- **GCP Cloud Tasks / QStash**: Orchestrates cron scheduling and notification retries with resilient backoff.

---

## 3. Core User Flows & Component Interactions

### 3.1 The Lifecycle of a Monitor Check (End-to-End)

This is the primary flow where a user sets up a monitor, and OpenStatus periodically checks it.

#### Phase 1: Configuration
The user defines a monitor in the **Dashboard** (`apps/dashboard`). The dashboard sends a request to the **Server** (`apps/server`), which validates and saves the configuration (URL, frequency, regions, assertions) to **LibSQL** via `@openstatus/db`.

#### Phase 2: Scheduling & Routing
1.  **Trigger**: A cron job runs in **Workflows** (`apps/workflows/src/cron/checker.ts`).
2.  **Dispatch**: The workflow fetches active monitors and creates tasks in **GCP Cloud Tasks** or **QStash**.
3.  **Regional Routing**: Tasks include headers like `fly-prefer-region` to ensure the "execute check" request lands on a **Checker** instance in the specific geographic region requested (e.g., `ams`, `sfo`).

#### Phase 3: Execution (The Checker)
1.  **Ingestion**: The Go **Checker** (`apps/checker`) receives the request from Google Cloud Tasks.
2.  **Probing**: 
    -   The `HTTPCheckerHandler` (in `apps/checker/handlers/checker.go`) parses the request.
    -   Uses `httptrace` to measure exact timing: DNS, TLS Handshake, TTFB, and Transfer.
    -   Performs TCP or DNS probes if configured.
3.  **Assertion Evaluation**: The checker evaluates user-defined rules (Using `@openstatus/assertions`) to verify the response (e.g., status == 200, body contains "Success").

#### Phase 4: Result Processing & State Transition
1.  **Telemetry**: Raw results (latency, status, body, headers) are sent to **Tinybird** (`@openstatus/tinybird`) immediately for high-speed ingestion and analytics.
2.  **Quorum Logic**: The checker calls back to **Workflows**. The system checks if a quorum (e.g., 50% of regions) agrees on a failure before triggering a global status change (Operational -> Down).
3.  **Incident Management**: If a status change is confirmed, an incident is created or resolved in the `incidentTable`.

#### Phase 5: Alerting
1.  **Dispatch**: **Workflows** identifies attached notification channels via `alerting.ts`.
2.  **Resilience**: Uses the **Effect** library and `@openstatus/notifications` to handle retries and deduplication, ensuring Slack, PagerDuty, or Emails are delivered reliably.

---

### 3.2 Status Page Viewing
1.  **Public Access**: End-users visit a status page (e.g., `status.example.com`) hosted by `@openstatus/status-page`.
2.  **Data Retrieval**: The app fetches real-time data (current status, uptime history, incidents) from the API (`@openstatus/server`).
3.  **Aggregation**: The API aggregates this data from Tinybird (for metrics) and Turso (for incident metadata).
4.  **Display**: The page renders the system status, incident timelines, and uptime graphs.

---

### 3.3 Incident Management
1.  **Creation**: An incident is created automatically (by a failed check quorum) or manually via the Dashboard.
2.  **Management**: The user updates the incident status (Investigating -> Identified -> Monitoring -> Resolved) on the Dashboard.
3.  **Reporting**: Each update can trigger notifications to subscribers via `@openstatus/workflows`.
4.  **Visibility**: The status page reflects these updates in real-time.

---

## 4. Component Interaction & Responsibilities

| Component | Role | Interactions |
| :--- | :--- | :--- |
| **`apps/server`** | The "Brain" | Central API for Dashboard/Status Page; reads/writes LibSQL; queries Tinybird. |
| **`apps/workflows`** | The "Conductor" | Schedules pings via Cloud Tasks; processes alerting logic; manages incidents. |
| **`apps/checker`** | The "Runner" | Stateless execution engine; probes targets; pushes telemetry to Tinybird. |
| **`packages/db`** | System of Record | Relational data: Users, Monitor configs, Incidents. |
| **`packages/tinybird`** | The "Memory" | High-volume time-series storage; provides aggregated metrics. |

---

## 5. Checker Discovery & Registration

### 5.1 Public Checkers (`apps/checker`)
Public checkers use a **static, configuration-based discovery** model.
- **Discovery Mechanism**: No dynamic registry. The central scheduler (`apps/workflows`) constructs URLs based on predictable naming and hardcoded region lists in `packages/regions/index.ts`.
- **Worker Identity**: Workers read their identity from environment variables (`FLY_REGION`, etc.) to report their location, but don't need to "announce" themselves to receive tasks.

### 5.2 Private Locations (`apps/private-location`)
Private locations use a **token-based polling** model (Pull Model).
- **Registration**: Agents start with an `OPENSTATUS_KEY` and connect to the ingestion server.
- **Polling**: Every 10 minutes, the agent polls the server for monitor configurations linked to its token.
- **Local Execution**: The agent maintains an internal scheduler to run checks locally and pushes results back via RPC calls. This allows operation behind firewalls without inbound ports.

---

## 6. Unique Technical Decisions & Infrastructure Nuances

- **Effect Library**: Powers the workflow engine to manage the complexity of asynchronous side-effects (notifications, retries, error handling).
- **ConnectRPC**: Used for communication between the central server and **Private Location** agents, providing type-safe Protobuf definitions over HTTP/2.
- **Fly.io Replay**: The checker uses `fly-replay` headers to act as a global gateway that routes traffic to specific regional instances.
- **Tinybird for Flapping**: Metric aggregation in Tinybird allows the system to handle "flapping" monitors by querying short-term window averages via SQL pipes.
- **Multi-Region Strategy**: Checker instances are deployed globally. Cloud Tasks uses regional routing headers (`fly-prefer-region`, `X-KOYEB-REGION-OVERRIDE`) to target specific geographies.

---

## 7. Building & Running

### Local Development
- **Docker Compose**: Starts LibSQL, Tinybird-Local, and all app containers for a "Cloud-in-a-box" experience.
- **DOCKER.md**: Guides users through migrations and seeding.

### Production
- **TypeScript Apps**: Multi-stage Docker builds optimized for size, orchestrated by `turbo build`.
- **Go Checker**: Compiled into lightweight binaries for rapid deployment to edge regions.

---

## 8. Refinement Audit (Planned Enhancements)

- **Advanced JSON Body Assertions**: Moving from top-level key matching to full JSONPath support.
- **Centralized Orchestration**: Finalizing the migration of all trigger logic from `server` to `workflows`.
- **Private Location Auth**: Enhancing API keys with certificate-based authentication.
- **Rate Limit Visibility**: Surfacing Upstash rate-limit status directly to users in the Dashboard.
