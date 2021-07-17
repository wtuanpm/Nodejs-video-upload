import express, { Request, Response } from 'express';
import { verifyClientController } from './auth/controller';

const router = express.Router();

// auth routes
router.post('/auth/verify-client', verifyClientController);

export default router;
