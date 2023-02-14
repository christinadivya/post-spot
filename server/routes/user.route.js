import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user.controller';

const router = express.Router();
router.route('/change-password').post(validate(paramValidation.password),userCtrl.changePassword);
router.route('/profile').get(userCtrl.getProfile);
router.route('/logout').post(userCtrl.logout);
router.route('/reset-password').post(validate(paramValidation.resetPassword),userCtrl.resetPassword);
router.route('/view-all').get(userCtrl.viewAll);
router.route('/update-profile').post(userCtrl.updateProfile);
router.route('/update-specification').post(userCtrl.addSpecification);
router.route('/my-comments').get(userCtrl.myCommentsList);
router.route('/view-car').get(userCtrl.viewCar);
router.route('/edit-car').post(userCtrl.editCar);
router.route('/car-list').get(userCtrl.getcarList);
router.route('/model-list').get(userCtrl.getmodelList);
router.route('/my-model-list').get(userCtrl.getmymodelList);
router.route('/car-user').get(userCtrl.getcaruserList);
router.route('/delete-pics').post(userCtrl.deletepersonalPictures);
router.route('/delete-cars').post(userCtrl.deleteCars);
router.route('/visiters').get(userCtrl.visitedUsers);
router.route('/delete-tag').post(userCtrl.deleteTag);
router.route('/change-mobile').post(validate(paramValidation.changeMobile),userCtrl.changeMobile);
router.route('/verify-otpmobile').post(validate(paramValidation.verifyOtpMobile),userCtrl.verifyOtpMobileChange);
router.route('/resend-otp').get(validate(paramValidation.resendOtp),userCtrl.resendOtp);


export default router;
