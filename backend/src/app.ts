import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*"
      ? "*"
      : env.corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: env.corsOrigin !== "*",
  }),
);
app.use(express.json());

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
