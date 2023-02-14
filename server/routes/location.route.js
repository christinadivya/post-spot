import express from 'express';
import locationCtrl from '../controllers/location.controller';
import paramValidation from '../../config/param-validation';
import validate from 'express-validation';


const router = express.Router();

router.route('/go-live').post(locationCtrl.location);
router.route('/show-location').post(locationCtrl.showLocation);
router.route('/get-location').get(locationCtrl.getLocation);
router.route('/get-current').get(locationCtrl.getCurrentLocation);
router.route('/track-user').post(validate(paramValidation.tracking),locationCtrl.trackLive);
router.route('/gone-live').post(locationCtrl.updateGoLive);
router.route('/is-live').get(locationCtrl.isLive);
router.route('/').get(locationCtrl.getCurrent);

export default router;
