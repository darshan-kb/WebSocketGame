const { Router } = require('express');
const {requireAuth} = require('../middleware/authMiddleware');
const authController = require('../controller/authController');


const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/slotmachine', authController.slotmachine);
router.get('/report', requireAuth, authController.report);
router.get('/logout', authController.logout_get);

module.exports = router;