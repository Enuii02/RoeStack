---
title: Tech Stack
description: The languages, frameworks, and tools RoeStack is built on.
---

# Tech Stack

RoeStack is a server-rendered web application built on the Node.js ecosystem, with MySQL for persistence and Docker for local orchestration.

## Runtime and Language

| Layer       | Choice                       |
| ----------- | ---------------------------- |
| Runtime     | Node.js                      |
| Language    | JavaScript (CommonJS modules) |

## Backend

| Concern              | Library              | Purpose                                                    |
| -------------------- | -------------------- | ---------------------------------------------------------- |
| HTTP framework       | `express`            | Routing, middleware pipeline, request/response handling.   |
| Templating           | `pug`                | Server-rendered HTML views.                                |
| Sessions             | `express-session`    | Cookie-backed user sessions for authentication state.      |
| Validation           | `express-validator`  | Form and request body validation.                          |
| Password hashing     | `bcryptjs`           | Hashing and verifying user passwords.                      |
| File uploads         | `multer`             | Handling `multipart/form-data` for avatars and media.      |
| Date/time            | `luxon`              | Formatting and manipulating timestamps.                    |
| Environment config   | `dotenv`             | Loading `.env` values into `process.env`.                  |
| Process supervision  | `supervisor`         | Restarts the server on file changes during development.    |

## Database

| Concern         | Choice                                |
| --------------- | ------------------------------------- |
| Database engine | MySQL                                 |
| Driver          | `mysql2/promise` (used by the app code) |
| Admin UI        | phpMyAdmin (via Docker Compose)       |

## Frontend

The frontend is rendered server-side as HTML via Pug templates, with vanilla JavaScript for interactivity on the client.

| Concern             | Choice                  |
| ------------------- | ----------------------- |
| Views               | Pug templates           |
| Styles              | Plain CSS (per page)    |
| Client scripts      | Vanilla JavaScript      |

## Tooling

| Concern              | Choice                |
| -------------------- | --------------------- |
| Containers           | Docker, Docker Compose |
| End-to-end testing   | Nightwatch.js         |
| Hosting (live demo)  | Railway               |
| Version control      | Git, GitHub           |
| CI                   | GitHub Actions        |
