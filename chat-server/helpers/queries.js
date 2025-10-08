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
        db.run(`INSERT INTO messages (messageText, fromUser, toUser, time, isSeen) VALUES (?, ?, ?, ?, ?)`, [content, fromUser, toUser, timeStamp, 0], function(err) {
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

function saveFileMessageMap(db, filePath, messageId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO file_message_map (filePath, messageId) VALUES (?, ?)`, [filePath, messageId], function(err) {
            if (err) {
                reject(err);
            } else {
                // return rows;
                resolve({
                    id: this.lastID,
                    path : filePath,
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
                 GROUP_CONCAT(f.filePath) AS files
             FROM messages m
                      LEFT JOIN file_message_map f ON m.id = f.messageId
             WHERE m.fromUser = ? OR m.toUser = ?
             GROUP BY m.id`,
            [user1, user1],
            (err, rows) => {
                if (err) return resolve([]);

                // Convert CSV file list → array
                const result = rows.map(r => ({
                    ...r,
                    files: r.files ? r.files.split(",") : [],
                }));

                resolve(result);
            }
        );
    })

}

module.exports = {getAllUsers, getMessages, saveMessage, getUser, seenMessage, saveFileMessageMap, getMessageWithFiles}