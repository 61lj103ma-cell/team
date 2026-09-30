const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getDepartments);
router.post('/', restrictTo('ADMIN'), createDepartment);
router.put('/:id', restrictTo('ADMIN'), updateDepartment);
router.delete('/:id', restrictTo('ADMIN'), deleteDepartment);

module.exports = router;
