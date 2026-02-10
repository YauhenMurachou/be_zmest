import { Router } from 'express';
import { getCaptchaUrl } from '../controllers/security.controller';

const router = Router();

router.get('/get-captcha-url', getCaptchaUrl);

export default router;

