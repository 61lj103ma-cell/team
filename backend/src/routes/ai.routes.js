const express = require('express');
const router = express.Router();
const { analyzeDraft, askAssistant } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/analyze-draft', analyzeDraft);
router.post('/assistant', askAssistant);

module.exports = router;
