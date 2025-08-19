# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sumu-machi-backend** is a NestJS backend API for a commute-oriented portal targeting the Tokyo metropolitan area. The MVP focuses on:

1. Users input **勤務地駅** (work station, Japanese route code/station name)
2. Returns **candidates within 30 minutes direct access** grouped by rail lines with SUUMO links
3. Records **behavioral events** (input, view, external links, detail views) for future B2B data products

## Development Commands

```bash
# Install dependencies
npm install

# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debug mode

# Building
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm run test               # Unit tests
npm run test:watch         # Unit tests in watch mode
npm run test:e2e           # End-to-end tests
npm run test:cov           # Test coverage

# Code quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
```

## Architecture & Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL 16 with TypeORM (planned)
- **Code Quality**: ESLint, Prettier with strict TypeScript config
- **Testing**: Jest for unit and E2E tests
- **Containerization**: Docker Compose (planned for Postgres + App)

## Project Structure (Current/Planned)

```
/src
  /modules
    /stations          # Station and railway line APIs
    /commutes          # Commute calculation logic
    /events            # Behavioral event tracking
    /users             # User management (future login functionality)
  /common              # Shared constants, filters, interceptors
  /database            # TypeORM entities, migrations
  /config              # Environment configuration, validation schemas
/test                  # Unit & E2E tests
```

## Database Design (Planned TypeORM Entities)

- **stations**: id (uuid), name_ja (text), line_code (varchar), geo (geometry)
- **commute_candidates**: origin_station_id, candidate_station_id, minutes
- **events**: event_type (input/view/click/detail), payload (jsonb), created_at
- **users**: Reserved for future authentication

## API Design (Planned)

### Commute Search
- **POST** `/commutes/search`
- Body: `{ origin: "渋谷" }`
- Response: Candidate stations with line info, travel time, and SUUMO URLs

### Event Tracking
- **POST** `/events`
- Body: `{ type: "click", payload: { station: "恵比寿" } }`

## Code Conventions

- **Comments**: Traditional Chinese for internal maintenance
- **External strings** (API responses, DB fields): Japanese for user-facing content
- **Architecture**: Follow FAANG standards with NestJS best practices
- **Testing**: Target >80% coverage
- **Commits**: Use Conventional Commits with commitlint

## Current State

This is a fresh NestJS project with basic scaffolding. The core modules (stations, commutes, events) and database integration are yet to be implemented according to the SPEC.md requirements.