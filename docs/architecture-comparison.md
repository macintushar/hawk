# Architecture Comparison: OpenStatus vs. Hawk

This document compares **OpenStatus** (the reference architecture) and **Hawk** (the new project implementation plan).

## 1. Core Philosophy & Vision

| Feature             | OpenStatus                                                                    | Hawk                                                                                |
| :------------------ | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Primary Goal**    | High-performance, distributed synthetic monitoring with sub-second analytics. | "Write Once, Run Anywhere" uptime monitoring focusing on deployment flexibility.    |
| **Target Audience** | Enterprise/Cloud-native users needing scale and complex analytics.            | Developers/SMBs wanting a flexible tool that runs on a $5 VPS _or_ Serverless Edge. |
| **Complexity**      | **High** (Microservices, Go agents, specialized DBs).                         | **Medium** (3-service architecture, unified DB).                                    |

## 2. Architecture & Components

**OpenStatus** uses a complex, specialized microservices approach:

- **Monorepo:** Turborepo + pnpm.
- **Languages:** TypeScript (Next.js/Hono) for web/API, **Go** for Checkers.
- **Services:** Separated into `server` (API), `workflows` (Orchestrator), `checker` (Go), `private-location` (Go), `status-page`, `dashboard`.
- **Communication:** ConnectRPC (gRPC) for private agents, Cloud Tasks/QStash for scheduling.

**Hawk** uses a simplified "3-Service" architecture designed for dual-mode deployment:

- **Monorepo:** Turborepo.
- **Languages:** **100% TypeScript** (Next.js 15 + Hono/Bun).
- **Services:**
  1.  **UI:** Next.js dashboard (Reads directly from DB).
  2.  **Platform:** Hono orchestrator (The "Brain").
  3.  **Worker:** Hono stateless executor (The "Muscle").
- **Communication:** Pure HTTP Callbacks + Queue (BullMQ or QStash).

## 3. Data Strategy

| Component            | OpenStatus                                                                   | Hawk                                                                               |
| :------------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **System of Record** | **LibSQL/Turso** (SQLite based).                                             | **PostgreSQL** (Unified DB).                                                       |
| **Metrics Storage**  | **Tinybird (ClickHouse)**. Stores millions of raw pings for heavy analytics. | **PostgreSQL**. Uses standard tables (`monitor_checks`) with planned partitioning. |
| **Queues**           | Redis (Upstash) & GCP Cloud Tasks / QStash.                                  | **Dual-Strategy:** QStash (Serverless) OR BullMQ/Redis (Self-hosted).              |

## 4. Checker/Worker Implementation

- **OpenStatus (Go):**
  - Written in **Go** for raw performance.
  - Uses `httptrace` for low-level network timing.
  - Push-based (Cloud Tasks) for public, Pull-based (Polling) for private locations.
  - Complex regional routing (`fly-replay`, `fly-prefer-region`).

- **Hawk (TypeScript/Bun):**
  - Written in **Hono (Bun)**.
  - Stateless HTTP endpoint (`POST /execute`).
  - Deployment agnostic: The same code runs on AWS Lambda, Vercel Edge, or a Docker container.
  - Simpler design: Receives job -> Executes check -> POSTs result back to Platform.

## 5. Deployment Flexibility

- **OpenStatus:** Heavily optimized for cloud-native environments (Fly.io, Railway, Turso, Tinybird). "Cloud-in-a-box" via Docker Compose exists but is complex.
- **Hawk:** Explicitly designed for **Dual-Mode**:
  1.  **Server Mode:** Standard Docker/VPS with Redis/Postgres (Self-contained).
  2.  **Serverless Mode:** Vercel (UI/Platform) + Vercel Edge (Workers) + Neon (DB) + QStash (Queue).

## Summary

**OpenStatus** is a heavy-duty, scalable commercial platform utilizing specialized tools (ClickHouse, Go, RPC) for high-throughput monitoring.

**Hawk** is a pragmatic, "middle-ground" alternative. It sacrifices the extreme scale of ClickHouse and the raw speed of Go for **portability and simplicity**. It uses a unified TypeScript stack and a single Postgres database to allow users to run the same platform on a cheap VPS or a globally distributed serverless network.
