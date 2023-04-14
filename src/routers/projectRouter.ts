import { Router } from 'express';
import { createProject } from '../controllers/projectContoller';
import { getProject } from '../controllers/projectContoller';
import { authenticateToken } from '../middlewares/verifyJWT';

const router = Router();

router.post('/create',authenticateToken,createProject);
router.get('/:userId',authenticateToken,getProject);

export default router;