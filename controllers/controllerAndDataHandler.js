const ChatDB = require('../models/chatDB');

const formatDate = () => {
  const now = new Date();
  const search = '/';
  const replacer = new RegExp(search, 'g');
  const date = now.toLocaleDateString('pt-BR',
    { hour: 'numeric', minute: 'numeric', hour12: true });
  const result = date.replace(replacer, '-');
  return result;
};

const formatMessage = (message, nickname, timestamp) => {
  let contentMessage = `${timestamp} - ${nickname}: `;
  contentMessage += message;
  return contentMessage; 
};

const controllerNewMessage = (message, nickname) => {
  const timestamp = formatDate();
  const msg = formatMessage(message, nickname, timestamp);
  ChatDB.saveMessage({ message, nickname, timestamp })
    .then((value) => value)
    .then((value) => console.log(value.ops[0]))
    .catch((error) => console.error(error));
  return msg;
};

const controllerGetAllMessages = async () => {
  const allMessages = await ChatDB.getAllMessage();
  return allMessages.map(({ message, nickname, timestamp }) => (
    formatMessage(message, nickname, timestamp)));
};

module.exports = {
  controllerNewMessage,
  controllerGetAllMessages,
};
