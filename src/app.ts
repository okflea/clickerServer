import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';

import authRoutes from './routes/auth';
import logoutRoute from './routes/logout';
import userRoute from './routes/users';
import meRoute from './routes/me';
import { Server } from 'socket.io';

const app = express();
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

  socket.on('bananaClick', async ({ userId }) => {
    try {
      // Update the user's score in the database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          score: { increment: 1 },
        },
        select: { id: true, name: true, score: true },
      });

      // Emit the updated score back to the client
      socket.emit('scoreUpdate', updatedUser.score);

      // Optionally, update high scores for all connected clients
      const highScores = await prisma.user.findMany({
        select: {
          id: true, status: true, name: true, score: true, email: true, isBlocked: true, isAdmin: true, createdAt: true
        },
        orderBy: { score: 'desc' },
        take: 10
      });
      // console.log(highScores);

      socket.emit('highScoresUpdate', highScores);
    } catch (error) {
      console.error('Error updating score:', error);
    }
  });
});

//global prisma instance
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/me', meRoute);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
