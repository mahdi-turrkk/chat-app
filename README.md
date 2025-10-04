
# Chat app

This is a chat application developed with express.js,socket.io in backend and vue,vuetify in frontend and sqlite for database.

## Run Locally

Clone the project

```bash
  git clone https://github.com/mahdi-turrkk/chat-app.git
```

Go to the project directory

```bash
  cd chat-app
```

Install Backend dependencies(in project directory)

```bash
  cd chat-server
  npm install
```

Create Db file from chatApp.db.example

```
  simply can done by renaming chatApp.db.example to chatApp.db
```

Start the server

```bash
  node server
```

Install Frontend dependencies

```bash
  cd chat-client
  npm install
```

Create .env file
 ```
    can create from .env.example 
    set backend url to VITE_BACKEND_URL
 ```

Start the client side

```bash
  npm run dev
```

 now you can see frontend at http://localhost:5173


## Authors

- [@mahdi-turrkk](https://www.github.com/mahdi-turrkk)

