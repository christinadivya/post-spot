import express from 'express';
import listCtrl from '../controllers/list.controller';

const router = express.Router();
router.route('/country').get(listCtrl.countryCode);
router.route('/cars').get(listCtrl.staticCars);
router.route('/city').get(listCtrl.city);
router.route('/fuels').get(listCtrl.fuels);
router.route('/state').get(listCtrl.state);
router.route('/about-us').get(listCtrl.aboutUs);
router.route('/terms').get(listCtrl.termsCondition);
router.route('/notification_type').get(listCtrl.notificationType);

export default router;
