
const express = require('express');
const router = express.Router();
const { addWarehouseEntry, updateWarehouseEntry, getAllWarehouse, deleteWarehouseEntry } = require('../controllers/warehouseController');
// const multer = require('multer');

// const storage = multer.memoryStorage(); 
// const upload = multer({ storage });

const upload = require('../../config/multerConfig');
// Thêm phiếu nhập kho
router.post('/add', addWarehouseEntry);

// Cập nhật phiếu nhập kho
// router.put('/update/:id', updateWarehouseEntry);
router.put('/update/:id', upload.single('image'), updateWarehouseEntry);

//

router.get('/', getAllWarehouse)
router.delete('/delete/:id', deleteWarehouseEntry);
module.exports = router;
