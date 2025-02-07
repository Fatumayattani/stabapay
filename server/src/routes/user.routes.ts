import { Router } from 'express';
import { UserController, userUpdateValidation } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/', userController.createUser);
router.get('/search', userController.searchUsers);

// Protected routes
router.use(authenticate);
router.get('/profile', userController.getProfile);
router.patch('/profile', userUpdateValidation, userController.updateProfile);

export const userRoutes = router;
