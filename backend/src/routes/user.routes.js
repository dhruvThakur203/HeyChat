const router = require('express').Router();
const { searchUsers } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, searchUsers);

module.exports = router;


