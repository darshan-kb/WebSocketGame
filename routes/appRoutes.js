const { Router } = require('express');
const {requireAuth, adminCheck, loggedIn} = require('../middleware/authMiddleware');
const authController = require('../controller/authController');


const router = Router();

router.get('/', authController.home);
router.get('/signup',adminCheck, authController.signup_get);
router.post('/signup',adminCheck, authController.signup_post);
router.get('/admin', adminCheck, authController.admin_get);
router.post('/admin', adminCheck, authController.admin_post);
router.get('/login', loggedIn, authController.login_get);
router.post('/login', loggedIn, authController.login_post);
router.get('/slotmachine', requireAuth, authController.slotmachine);
router.get('/report', requireAuth, authController.report);
router.get('/logout', authController.logout_get);

module.exports = router;