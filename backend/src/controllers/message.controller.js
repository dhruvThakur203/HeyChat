const Message = require('../models/Message');
const Chat = require('../models/Chat');

async function sendMessage(req, res) {
  const { content, chatId } = req.body;
  if (!content || !chatId) return res.status(400).json({ message: 'Missing content or chatId' });
  let message = await Message.create({ sender: req.user._id, content, chat: chatId });
  message = await message.populate([
    { path: 'sender', select: 'name email pic' },
    { path: 'chat' },
  ]);
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });
  res.status(201).json(message);
}

async function allMessages(req, res) {
  const { chatId } = req.params;
  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name email pic')
    .populate('chat');
  res.json(messages);
}

module.exports = { sendMessage, allMessages };


