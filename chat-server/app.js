import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import fileServeRoute from "./routes/fileServeRoute.js";

const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());

// routes
app.use("/api", authRoutes);
app.use("/api", fileServeRoute);

export default app;