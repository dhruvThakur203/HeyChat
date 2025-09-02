const Chat = require('../models/Chat');
const User = require('../models/User');

async function accessChat(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId required' });
  let chat = await Chat.findOne({
    isGroupChat: false,
    $and: [{ users: { $elemMatch: { $eq: req.user._id } } }, { users: { $elemMatch: { $eq: userId } } }],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  if (chat) return res.json(chat);

  const newChat = await Chat.create({
    chatName: 'sender',
    isGroupChat: false,
    users: [req.user._id, userId],
  });
  const fullChat = await Chat.findById(newChat._id).populate('users', '-password');
  return res.status(201).json(fullChat);
}

async function fetchChats(req, res) {
  const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });
  res.json(chats);
}

async function createGroupChat(req, res) {
  const { name, users } = req.body;
  if (!name || !Array.isArray(users) || users.length < 2) {
    return res.status(400).json({ message: 'At least 2 users plus you required' });
  }
  const allUsers = [...new Set([...users, String(req.user._id)])];
  const group = await Chat.create({
    chatName: name,
    users: allUsers,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });
  const fullGroup = await Chat.findById(group._id)
    .populate('users', '-password')
    .populate('groupAdmin', '-password');
  res.status(201).json(fullGroup);
}

async function renameGroup(req, res) {
  const { chatId, chatName } = req.body;
  const updated = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');
  res.json(updated);
}

async function addToGroup(req, res) {
  const { chatId, userId } = req.body;
  const updated = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');
  res.json(updated);
}

async function removeFromGroup(req, res) {
  const { chatId, userId } = req.body;
  const updated = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');
  res.json(updated);
}

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };


