# RoeStack

A web app for Computing students to help each other with projects, connecting people with the same or similar modules via Reddit-like communities, all while finding useful student contacts (such as student or programme representatives and mentors through RoeBuddies). The main objective of this project is to aid students and university staff by sharing guidance (while avoiding academic misconduct) and explaining difficult or interesting topics.

> This project was built as part of a university coursework assignment at the **University of Roehampton**.

## Live Demo

A hosted version of the app is available at:

**[roestack-production.up.railway.app](https://roestack-production.up.railway.app)**

Some functionality may be limited in the demo environment.

## Setup

Below is the step-by-step procedure for installing and running a local dockerized web server for the webapp.

### Prerequisites

You will need the following installed:

* [Node.js](https://nodejs.org/en/download/) (Windows installer linked)
* [Docker Desktop](https://docs.docker.com/desktop/windows/install/) (on Windows this will prompt you to install WSL)

### Running the app

1. Make sure no other containers are currently running in Docker.
2. Install dependencies:

   ```bash
   npm install
   ```
3. Build and start the stack:

   ```bash
   docker-compose up --build
   ```

### Accessing the services

| Service       | URL                     |
| ------------- | ----------------------- |
| Express app   | http://localhost:3000   |
| phpMyAdmin    | http://localhost:8081   |

## Documentation

In-depth documentation lives under the [`docs/`](docs/README.md) directory:

* [Tech Stack](docs/stack.md)
* [Architecture (MVC)](docs/architecture.md)
* [Contributors](docs/contributors.md)

## Collaborators

* Matteo
* Mateusz
* Oleksandr
* Julianna
