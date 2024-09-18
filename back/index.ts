import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import { authRouter } from './entities';

const { PORT } = Bun.env as {
  PORT: string;
};

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: '*',
    // credentials: true,
  })
);

app.use(express.json());

app.use('/auth', authRouter);

httpServer.listen(PORT, () => {
  console.log(`Server running on port localhost:${PORT}`);
});
