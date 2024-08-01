import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
var morgan = require('morgan');

import authRoutes from './routes/auth';
import userRoute from './routes/users';
import meRoute from './routes/me';
import { Server } from 'socket.io';

const app = express();
app.use(morgan('combined'))
//socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true
  }
})

io.on("connection", (socket) => {
  console.log("Socket connected: " + socket.id);

  socket.on('login', async (userId: string) => {
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: "ONLINE"
      }
    })
  });

  socket.on('logout', async (userId: string) => {
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: "OFFLINE"
      }
    })
  });

  socket.on("updateScore", async (data) => {
    //increment score 
    await prisma.user.update({
      where: {
        id: data?.userId
      },
      data: {
        score: {
          increment: 1
        }
      }
    })

    //emit score update
    const highScores = await prisma.user.findMany({
      orderBy: {
        score: 'desc'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        score: true,
        status: true
      }
    })
    io.emit("highScores", highScores)
  })
});

//global prisma instance
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoute);
app.use('/api/me', meRoute);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
