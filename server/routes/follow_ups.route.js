import express from 'express';
import followCtrl from '../controllers/follow_ups.controller';

const router = express.Router();

router.route('/follow-unfollow').post(followCtrl.followUser);
router.route('/follow-list').get(followCtrl.listFollow);
router.route('/following-list').get(followCtrl.listFollowing);
router.route('/post').post(followCtrl.post);
router.route('/feed').get(followCtrl.listPost);
router.route('/comments').post(followCtrl.comments);
router.route('/block').post(followCtrl.block);
router.route('/share').post(followCtrl.share);
router.route('/deletePost').post(followCtrl.deletePost);
router.route('/report').post(followCtrl.report);
router.route('/newsFeed').get(followCtrl.newsFeed);
router.route('/countList').get(followCtrl.countList);
router.route('/deleteComment').post(followCtrl.deleteComment);
router.route('/editPicture').post(followCtrl.editPicture);
router.route('/follow-list-withoutPage').get(followCtrl.listwithoutPage);

export default router;
