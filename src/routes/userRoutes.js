const Router = require('@koa/router');
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

const router = new Router({ prefix: '/api' });

router.get('/users', authenticate, allowRoles('admin'), userController.listUsers);
router.post('/users', authenticate, allowRoles('admin'), userController.createUser);
router.get('/residents', authenticate, allowRoles('admin', 'fasil'), userController.listResidents);

module.exports = router;