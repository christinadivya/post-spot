import express from 'express';
import passport from 'passport';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import listRoutes from './list.route';
import tokenRoutes from './tokens.route';
import notificationRoutes from './notification.route';
import LocationRoutes from './location.route';
import eventRoutes from './events.route';
import followRoutes from './follow_ups.route';

const isAuthenticated = passport.authenticate('jwt', { session: false });
const router = express.Router(); // eslint-disable-line new-cap

router.use('/user', isAuthenticated,  userRoutes);
router.use('/auth', authRoutes);
router.use('/list', listRoutes);
router.use('/token',isAuthenticated, tokenRoutes);
router.use('/location', isAuthenticated,  LocationRoutes);
router.use('/event', isAuthenticated, eventRoutes);
router.use('/follow', isAuthenticated, followRoutes);
router.use('/notifications', isAuthenticated, notificationRoutes);


export default router;
