const connectionDb = require('./connection');

const getCollection = async (nameCollection = 'messages') => (
  connectionDb()
    .then((db) => db.collection(nameCollection)));

const saveMessage = async ({ message, nickname, timestamp }) => {
  const collection = await getCollection();
  const newMessage = await collection.insertOne({
    message,
    nickname,
    timestamp,
  });
  return newMessage;
};

const getAllMessage = async () => {
  const collection = await getCollection();
  return collection.find().toArray();
};

module.exports = {
  saveMessage,
  getAllMessage,
};