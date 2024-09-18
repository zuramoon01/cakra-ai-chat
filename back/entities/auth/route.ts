import express from 'express';
import { signIn, signUp } from './controller';

const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);

export { authRouter };
