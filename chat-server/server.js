const express = require('express')
const cors = require('cors')
const app = express()
const sqlite3 = require('sqlite3').verbose()
const httpServer = require("http").createServer(app);
const queries = require('./helpers/queries')
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:8080",
    },
});
const db = new sqlite3.Database('chatApp.db', (err) => {
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
                res.status(200).json({message: 'Authentication successful'})
            }
        }
    });
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
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
});

io.on("connection", (socket) => {
    // fetch existing users
    let users = []
    queries.getAllUsers(db).then((result) => {
        users = result
        const usernames = []
        let allMessages = []
        queries.getMessages(db, socket.username).then((messages) => {
            allMessages = messages
            for (let i = 0; i < users.length; i++) {
                users[i] = {
                    username: users[i].username,
                    name: users[i].name,
                    userID: undefined,
                    messages: allMessages.filter(message => (message.toUser == users[i].username || message.fromUser == users[i].username))
                }
                usernames.push(users[i].username)
            }
            for (let [id, socket] of io.of("/").sockets) {
                const location = usernames.indexOf(socket.username)
                if (location != -1)
                    users[location].userID = id
            }
            socket.emit("users", users);

            queries.getUser(db, socket.username).then((user) => {
                // notify existing users
                socket.broadcast.emit("user connected", {
                    userID: socket.id,
                    username: socket.username,
                    name: user[0].name
                });
            })
        })
    });


    // forward the private message to the right recipient
    socket.on("private message", ({content, to}) => {
        queries.saveMessage(db, content, socket.username, to.username).then((result) => {
            if (to.userID != undefined) {
                socket.to(to.userID).emit("private message", {
                    content: result,
                    from: socket.username,
                });
            }
        })
    });

    socket.on("seen message", ({fromUser, toUser, fromUserID}) => {
        queries.seenMessage(db, fromUser, toUser).then(() => {
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


httpServer.listen(PORT, () =>
    console.log(`server listening at http://localhost:${PORT}`)
);
