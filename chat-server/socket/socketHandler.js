import jwt from "jsonwebtoken";
import {
    getAllUsers,
    saveMessage,
    getUser,
    seenMessage,
    saveFileMessageMap,
    getMessageWithFiles
} from "../helpers/queries.js";
import db from "../config/db.js";

const SECRET_KEY = "thisIsATestChatApp";

export function initSocket(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error: Invalid token"));

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            socket.userId = decoded.id;
            next();
        } catch {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", async (socket) => {
        // fetch existing users
        let users = []
        getAllUsers(db).then((result) => {
            users = result
            const userIds = []
            let allMessages = []
            getMessageWithFiles(db, socket.userId).then((messages) => {
                allMessages = messages
                for (let i = 0; i < users.length; i++) {
                    users[i].messages = allMessages.filter(message => (message.toUser == users[i].id || message.fromUser == users[i].id))
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
        socket.on("private message", ({content, to, files}) => {
            saveMessage(db, content, socket.userId, to.id).then(async (result) => {
                if(files?.length){
                    result.files = []
                    for(let i=0;i < files.length;i++){
                        await saveFileMessageMap(db, files[i], result.id).then((fileResult) => {
                            result.files.push(fileResult.path)
                        })
                    }
                    if (to.userID != undefined) {
                        socket.to(to.userID).emit("private message", {
                            content: result,
                            from: socket.userId,
                        });
                    }
                }
                else {
                    if (to.userID != undefined){
                        result.files = []
                        socket.to(to.userID).emit("private message", {
                            content: result,
                            from: socket.userId,
                        });
                    }
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
}
