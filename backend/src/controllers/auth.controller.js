const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function register(req, res) {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });
  const user = await User.create({ name, email, password, pic });
  const token = generateToken(user._id);
  return res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token,
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  const token = generateToken(user._id);
  return res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token,
  });
}

module.exports = { register, login };


