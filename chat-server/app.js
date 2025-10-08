import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import fileServeRoute from "./routes/fileServeRoute.js";
import userEditRoutes from "./routes/userEditRoutes.js";
import fileUploadRoute from "./routes/fileUploadRoute.js";

const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());

// routes
app.use("/api", authRoutes);
app.use("/api", fileServeRoute);
app.use("/api", userEditRoutes);
app.use("/api", fileUploadRoute);

export default app;