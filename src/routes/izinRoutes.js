const Router = require('@koa/router');
const izinController = require('../controllers/izinController');
const authenticate = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = new Router({ prefix: '/api/izin' });

router.get('/', authenticate, izinController.list);
router.post('/', authenticate, allowRoles('penghuni'), upload.single('bukti'), izinController.create);
router.patch('/:id/status', authenticate, allowRoles('fasil', 'admin'), izinController.updateStatus);

module.exports = router;