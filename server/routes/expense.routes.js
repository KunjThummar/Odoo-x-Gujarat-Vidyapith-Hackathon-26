const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fuel_expense.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAllExpenses);
router.post('/', authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'), ctrl.createExpense);
router.put('/:id', authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'), ctrl.updateExpense);
router.delete('/:id', authorize('FLEET_MANAGER'), ctrl.deleteExpense);

module.exports = router;
