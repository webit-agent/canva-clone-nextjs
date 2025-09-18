import { Hono } from "hono";
import { handle } from "hono/vercel";

import ai from "./ai";
import users from "./users";
import images from "./images";
import projects from "./projects";
import subscriptions from "./subscriptions";
import upload from "./upload";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app
  .route("/ai", ai)
  .route("/users", users)
  .route("/images", images)
  .route("/projects", projects)
  .route("/subscriptions", subscriptions)
  .route("/upload", upload);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
