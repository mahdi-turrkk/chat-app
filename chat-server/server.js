import cors from 'cors';
import express from 'express'
const app = express()
import sqlite3 from "sqlite3";
const sqlite = sqlite3.verbose()
import {createServer} from 'http';
const httpServer = createServer(app)
import jwt from "jsonwebtoken";
import {Server} from "socket.io";
import {getAllUsers, getMessages, saveMessage, getUser, seenMessage} from "./helpers/queries.js";

const SECRET_KEY = 'thisIsATestChatApp'
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Replace with your frontend's URL
        methods: ['GET', 'POST'], // Allow methods used by Socket.IO
        credentials: true // Optional, if you need to send cookies or auth headers
    }
});
const db = new sqlite.Database('chatApp.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to the database');
    }
});
const PORT = 4000
app.use(cors())
app.use(express.json())
app.post('/api/login', (req, res) => {
    const {username, password} = req.body;
    db.all(`SELECT *
            FROM users
            WHERE username = "${username}"
              AND password = "${password}"`, (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({message: 'Internal Server Error'});
        } else {
            if (row.length == 0) {
                res.status(401).json({message: 'Invalid credentials'})
            } else {
                const token = jwt.sign({ username , id:row[0].id }, SECRET_KEY, { expiresIn: "24h" });
                res.status(200).json({message: 'Authentication successful', token: token})
            }
        }
    });
});

app.get('/api/me', (req, res) => {
    const { authorization } = req.headers;
    try {
        const decoded = jwt.verify(authorization, SECRET_KEY);
        res.status(200).json({message: 'Authorization successful', username: decoded.username , id: decoded.id})
    } catch (err) {
        res.status(401).json({message: 'Invalid token'})
    }
});

app.post('/api/register', (req, res) => {
    const {name, username, password} = req.body;
    db.all(`SELECT *
            FROM users
            WHERE username = "${username}"`, (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({message: 'Internal Server Error'});
        } else {
            if (row.length == 0) {
                db.run(`INSERT INTO users (name, username, password)
                        VALUES (?, ?, ?)`, [name, username, password], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({message: 'Internal Server Error'});
                    } else {
                        // return rows;
                        res.status(201).json({message: 'User Created'})
                    }
                })
            } else {
                res.status(400).json({message: 'User Existed'})
            }
        }
    });
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token; // client must send token here
    if (!token) return next(new Error("Authentication error: Invalid token"));

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.userId = decoded.id; // attach user data to socket
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});

io.on("connection", (socket) => {
    // fetch existing users
    let users = []
    getAllUsers(db).then((result) => {
        users = result
        const userIds = []
        let allMessages = []
        getMessages(db, socket.userId).then((messages) => {
            allMessages = messages
            for (let i = 0; i < users.length; i++) {
                users[i] = {
                    id: users[i].id,
                    username: users[i].username,
                    name: users[i].name,
                    userID: undefined,
                    messages: allMessages.filter(message => (message.toUser == users[i].id || message.fromUser == users[i].id))
                }
                userIds.push(users[i].id)
            }
            for (let [id, socket] of io.of("/").sockets) {
                const location = userIds.indexOf(socket.userId)
                if (location != -1)
                    users[location].userID = id
            }
            socket.emit("users", users);

            getUser(db, socket.userId).then((user) => {
                // notify existing users
                socket.broadcast.emit("user connected", {
                    socketID: socket.id,
                    id: socket.userId,
                    username: socket.username,
                    name: user[0].name
                });
            })
        })
    });

    // forward the private message to the right recipient
    socket.on("private message", ({content, to}) => {
        saveMessage(db, content, socket.userId, to.id).then((result) => {
            if (to.userID != undefined) {
                socket.to(to.userID).emit("private message", {
                    content: result,
                    from: socket.userId,
                });
            }
        })
    });

    socket.on("seen message", ({fromUser, toUser, fromUserID}) => {
        seenMessage(db, fromUser, toUser).then(() => {
            if (fromUserID != undefined) {
                socket.to(fromUserID).emit('seen message', {
                    user: toUser
                })
            }
        })
    })

    // notify users upon disconnection
    socket.on("disconnect", () => {
        socket.broadcast.emit("user disconnected", socket.id);
    });
});


httpServer.listen(PORT,"0.0.0.0", () =>
    console.log(`server listening at http://10.145.130.214:${PORT}`)
);
