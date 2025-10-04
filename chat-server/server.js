import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initSocket } from "./socket/socketHandler.js";

const PORT = 4000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
});

initSocket(io);

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});
