function getAllUsers(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT id ,name ,username, profileImage FROM users', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // return rows;
                resolve(rows)
            }
        })
    })
}

function getUser(db,id) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT name FROM users WHERE id="${id}"`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // return rows;
                resolve(rows)
            }
        })
    })
}

function getMessages(db, user1) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT id, messageText, fromUser, toUser, time, isSeen
            FROM messages
            WHERE fromUser='${user1}'
               OR toUser='${user1}';`, (err, rows) => {
            if (err) {
                resolve([]);
            } else {
                // return rows;
                resolve(rows)
            }
        })
    })
}

function saveMessage(db, content, fromUser, toUser) {
    return new Promise((resolve, reject) => {
        const date = new Date()
        const timeStamp = `${date.getFullYear()}/${date.getMonth() > 9 ? date.getMonth() : "0" + date.getMonth()}/${date.getDate() > 9 ? date.getDate() : "0" + date.getDate()}-${date.getHours() > 9 ? date.getHours() : "0" + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()}`
        db.run(`INSERT INTO messages (messageText, fromUser, toUser, time, isSeen) VALUES (?, ?, ?, ?, ?)`, [content?? '', fromUser, toUser, timeStamp, 0], function(err) {
            if (err) {
                reject(err);
            } else {
                // return rows;
                resolve({
                    id: this.lastID,
                    messageText : content,
                    fromUser : fromUser,
                    toUser : toUser,
                    time : timeStamp,
                    isSeen : 0
                })
            }
        })
    })
}

function seenMessage(db, fromUser, toUser) {
    return new Promise((resolve, reject) => {
        db.all(`UPDATE messages SET isSeen=1 WHERE fromUser="${fromUser}" AND toUser="${toUser}"`, (err) => {
            if (err) {
                resolve(false);
            } else {
                // return rows;
                resolve(true)
            }
        })
    })
}

function saveFileMessageMap(db, file, messageId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO file_message_map (filePath, fileType, messageId) VALUES (?, ?, ?)`, [file.fileName , file.fileType, messageId], function(err) {
            if (err) {
                reject(err);
            } else {
                // return rows;
                resolve({
                    id: this.lastID,
                    path : file.fileName,
                    type : file.fileType,
                })
            }
        })
    })
}

function getMessageWithFiles(db, user1){
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT
                 m.id, m.messageText, m.fromUser, m.toUser, m.time, m.isSeen,
                 GROUP_CONCAT(f.filePath || '::' || f.fileType, '||') AS files
             FROM messages m
                      LEFT JOIN file_message_map f ON m.id = f.messageId
             WHERE m.fromUser = ? OR m.toUser = ?
             GROUP BY m.id`,
            [user1, user1],
            (err, rows) => {
                if (err) return resolve([]);

                const typeOrder = {
                    image: 1,
                    video: 2,
                    voice: 3,
                };

                const result = rows.map(r => {
                    const files = r.files
                        ? r.files.split('||').map(fileStr => {
                            const [filePath, fileType] = fileStr.split('::');
                            return { fileName: filePath, fileType };
                        })
                            // custom order: compare main MIME type (before '/')
                            .sort((a, b) => {
                                const aMain = a.fileType.split('/')[0];
                                const bMain = b.fileType.split('/')[0];
                                return (typeOrder[aMain] || 99) - (typeOrder[bMain] || 99);
                            })
                        : [];

                    return { ...r, files };
                });

                resolve(result);
            }
        );
    })

}

module.exports = {getAllUsers, getMessages, saveMessage, getUser, seenMessage, saveFileMessageMap, getMessageWithFiles}