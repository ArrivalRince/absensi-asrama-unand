const Router = require('@koa/router');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware');

const router = new Router({ prefix: '/api/auth' });

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;