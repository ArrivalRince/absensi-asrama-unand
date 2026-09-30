const Router = require('@koa/router');
const presensiController = require('../controllers/presensiController');
const authenticate = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

const router = new Router({ prefix: '/api/presensi' });

router.get('/', authenticate, presensiController.list);
router.post('/', authenticate, allowRoles('penghuni'), presensiController.create);

module.exports = router;