const router = require('express').Router();
const { addItem, getInventory, updateItem, deleteItem, logUsage, getLowStock } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/low-stock', authorize('admin'), getLowStock);
router.post('/usage', authorize('mechanic'), logUsage);
router.route('/').get(authorize('admin'), getInventory).post(authorize('admin'), addItem);
router.route('/:id').put(authorize('admin'), updateItem).delete(authorize('admin'), deleteItem);

module.exports = router;
