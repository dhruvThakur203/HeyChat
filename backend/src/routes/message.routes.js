const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { sendMessage, allMessages } = require('../controllers/message.controller');

router.post('/', protect, sendMessage);
router.get('/:chatId', protect, allMessages);

module.exports = router;


