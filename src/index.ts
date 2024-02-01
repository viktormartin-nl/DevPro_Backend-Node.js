import express from 'express'
import dotenv from 'dotenv'
import path from 'path'

import authRoute from './routes/auth'
import protectedRoutes from './routes/protected'
import { connectDB } from './db/connect'
import { notFound } from './middleware/not-found'
import { errorHandlerMiddleware } from './middleware/error-handler'
import cors from 'cors'

import { Server } from "socket.io";
import Message from './models/Message'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000;

// middleware
app.use(cors())
app.use(express.json())
app.use('/', express.static(path.join(path.dirname(__dirname), 'uploads')));

// Routes
app.use('/user', authRoute);
app.use('/protected', protectedRoutes); // just for an brief example of a protected router

app.use(notFound)
app.use(errorHandlerMiddleware)

const start = async () => {

  try {

    const db = await connectDB();
    const http = app.listen(port, () => console.log(`Server listening on port ${port}...`))
    const io = new Server(http, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    })
    io.on('connection', (socket) => {
      console.log("connect")
      socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log('New client connected with user id', userId);
      });
      socket.on('sendMessage', async (data) => {
        console.log(data.recipient, data);

        const message = new Message(data);
        try {
          const newMessage = await message.save();
          console.log(newMessage)
        } catch (err) {
          console.error(err);
        }
        socket.to(data.recipient).emit('receiveMessage', data);
      });
      socket.on('notification', (data) => {

        io.emit('receiveNotification', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
    app.set('io', io);

  } catch (err) {
    console.log(err);
  }
}

start()
