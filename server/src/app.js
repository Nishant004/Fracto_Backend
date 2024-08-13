import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import http from 'http';
import { Server } from 'socket.io';

const app= express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

app.use(cors({

    origin: process.env.CORS_ORIGIN,
    credentials:true,
    //ready npm cors doc
}))

app.use(express.json({
    limit:"16kb"}))
app.use(express.urlencoded({
    extended:true,limit:'16kb'}))
//extended obj ke under bhi obj dekta hai
app.use(express.static("public"))
app.use(cookieParser())




// routes
import userRouter from "./routers/user.routers.js"

//routes declaration
app.use("/api/v1/users" , userRouter)

// Online users tracking object


import { registerUserSocket } from './controllers/user.controlllers.js';

const onlineUsers = {};

// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register user via socket
    socket.on('register', async (data, callback) => {
        try {
            const user = await registerUserSocket(data);
            callback({ status: 'success', user });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    });

    // Handle user login
    socket.on('user-login', (data) => {
        const { userId } = data;
        onlineUsers[userId] = socket.id;
        io.emit('online-users', Object.keys(onlineUsers));
    });

    // Handle user logout
    socket.on('user-logout', (data) => {
        const { userId } = data;
        delete onlineUsers[userId];
        io.emit('online-users', Object.keys(onlineUsers));
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
        if (userId) delete onlineUsers[userId];
        io.emit('online-users', Object.keys(onlineUsers));
    });
});



  export { server, io , onlineUsers};
  export default app

// export {app}