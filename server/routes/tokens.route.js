import express from 'express';
import tokenCtrl from '../controllers/tokens.controller';

const router = express.Router();

router.route('/')
  .post(tokenCtrl.create);

export default router;