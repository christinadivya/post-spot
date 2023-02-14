import express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/registration')
  .post(validate(paramValidation.createUser), authCtrl.create);

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), passport.authenticate('local', { session: false }), authCtrl.login);

router.route('/forgot-password')
  .get(validate(paramValidation.forgotPassword),authCtrl.forgotPassword);

router.route('/resend-otp')
  .get(validate(paramValidation.resendOtp),authCtrl.resendOtp);


router.route('/verify-otp')
  .get(validate(paramValidation.verifyOtp),authCtrl.verifyOtp);


router.route('/social-login')
  .post(authCtrl.socialLogin);

router.route('/set-version')
  .post(authCtrl.setVersion);

router.route('/get-version')
  .get(authCtrl.getVersion);
export default router;
