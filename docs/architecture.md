---
title: Architecture
description: The MVC structure of the RoeStack codebase and how a request flows through it.
---

# Architecture

RoeStack follows the classic **Model-View-Controller (MVC)** design pattern. Each layer has a clear responsibility, which keeps the codebase predictable and makes it easier for several developers to work in parallel without colliding.

## Directory Layout

```
app/
  controller/    Express route handlers; the C in MVC.
  model/         Data access layer; the M in MVC.
    classes/     Plain JavaScript classes that represent domain entities.
    middleware/  Express middleware that operates on the model layer.
    db.js        Shared MySQL connection pool and query helper.
  views/         Pug templates; the V in MVC.
    layout.pug   Shared base layout.
    pages/       Top-level pages rendered by controllers.
    partials/    Reusable fragments included by pages.
  utils.js       Helpers shared across layers.
```

## The Three Layers

### Model

The model layer is everything under `app/model/`. It is the only layer that talks to the database.

* `app/model/db.js` exposes a single MySQL connection pool plus a `query(sql, params)` helper. All database access goes through this helper so connection settings and pooling live in one place.
* `app/model/classes/` contains classes that map onto the project's domain concepts — `User`, `Post`, `Comment`, `Community`, and a `ContentManager` that coordinates operations across them. These classes encapsulate the SQL and expose intention-revealing methods to the controllers.
* `app/model/middleware/` holds Express middleware that needs to read from the model before a controller runs (for example, attaching a filtered list of posts to the request).

Controllers never write SQL directly. They ask the model layer for the data they need.

### View

The view layer is everything under `app/views/`. Views are Pug templates, rendered server-side by Express.

* `layout.pug` defines the shared page shell. Most pages extend it using Pug's `extends` directive.
* `pages/` contains a template per top-level page (login, profile, single-post, explore, and so on).
* `partials/` contains reusable fragments (header, sidebars, post card, comment list). Pages compose themselves by `include`-ing partials.

Views never call into the model directly. They render whatever data the controller hands them via `res.render(template, data)`.

### Controller

The controller layer is everything under `app/controller/`. Controllers are Express route handlers — one file per major feature area:

* `app.js` wires up middleware, the session, the view engine, and the route table.
* `loginController.js`, `userController.js`, `postController.js`, `commentController.js`, `communityController.js`, `voteController.js` handle the HTTP requests for each feature.

A controller's job is to read the request, call the appropriate model methods, decide which view to render, and pass the data to it. Controllers do not contain SQL and do not contain HTML.

## Request Lifecycle

A typical request follows the same path through the three layers:

1. **Express** receives the HTTP request and matches it against a route registered in `app/controller/app.js`.
2. **Middleware** runs in order: session, body parsers, validators, any feature-specific middleware from `app/model/middleware/`.
3. The **controller** handler executes. It calls one or more methods on the model classes to fetch or mutate data.
4. The **model** runs the SQL via the shared pool in `app/model/db.js` and returns plain objects or instances of the domain classes.
5. The controller calls `res.render('pages/...', data)` (or `res.redirect`, or returns JSON).
6. **Pug** compiles the template, the layout, and any included partials into HTML.
7. The response is sent back to the browser. Vanilla JavaScript under `static/js/` provides client-side interactivity.

## Static Assets

Static files (CSS, client JavaScript, images, icons, SVGs) live under `static/` and are served by Express's static-file middleware. The view templates reference them via absolute paths such as `/styles/login.css` or `/js/sidebar.js`.

## Why MVC for this project

MVC was chosen because it matches how the team divided work: one person could iterate on a Pug view or CSS file without touching SQL, another could add a query in a model class without breaking the templates, and route changes lived in a single controller file. The boundary between layers also made it straightforward to add cross-cutting features (sessions, validators, file uploads) as middleware without rewriting feature code.
