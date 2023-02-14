import express from 'express';
import eventCtrl from '../controllers/events.controller';
const router = express.Router();

router.route('/addEvent').post(eventCtrl.addEvent);
router.route('/updateEvent').post(eventCtrl.updateEvent);
router.route('/listEvent').get(eventCtrl.listEvent);
router.route('/listAllEvents').get(eventCtrl.listAllEvents);
router.route('/getEvent').get(eventCtrl.getEvent);
router.route('/deleteEvent').post(eventCtrl.deleteEvent);

export default router;
