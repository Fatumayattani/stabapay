import { Router } from 'express';
import { AuthController, authValidation } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.get('/nonce', authController.getNonce);
router.post('/authenticate', authValidation, authController.authenticate);

export const authRoutes = router;
