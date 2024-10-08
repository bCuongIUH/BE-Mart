const express = require('express');
const { getCategories,createCategory ,updateCategory,deleteCategory, getCategoriesName} = require('../controllers/categoryController');
const router = express.Router();

router.get('/', getCategories);
router.get('/byname', getCategoriesName);
router.post('/add', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
