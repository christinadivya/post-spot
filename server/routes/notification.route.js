import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import notifyCtrl from '../controllers/notification.controller';

const router = express.Router();

router.route('/')
  .get(notifyCtrl.notifyStatus);
router.route('/count')
  .get(notifyCtrl.count);
router.route('/update-status')
  .post(validate(paramValidation.updateStatus),notifyCtrl.updateStatus);
router.route('/get-detail')
  .get(validate(paramValidation.getDetail),notifyCtrl.getDetail);
export default router;