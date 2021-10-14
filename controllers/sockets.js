const { controllerNewMessage, controllerGetAllMessages } = require('./controllerAndDataHandler');

const usersOnline = {};

const message = (socket, io) => {
  socket.on('message', (data) => {
    const { chatMessage, nickname } = data;
    const msg = controllerNewMessage(chatMessage, nickname);
    io.emit('message', msg);
  });
};

const newLoggedInUser = (socket) => {
  socket.on('newLoggedInUser', async (nickName) => {
    usersOnline[socket.id] = nickName;
    socket.emit('loadingMsgAndUsersLogged', {
      nickname: Object.values(usersOnline),
      messages: await controllerGetAllMessages(),
    });
    socket.broadcast.emit('newLoggedInUser', nickName);
  });
};

const removeNicknameOnDisconnect = (socket) => { delete usersOnline[socket.id]; };

const disconnectedUser = (socket) => {
  socket.broadcast.emit('removed-user', usersOnline[socket.id]);
};

const disconnect = (socket) => {
  socket.on('disconnect', () => {
      console.log(`Usuario desconectado ${usersOnline[socket.id]}`);
      disconnectedUser(socket);
      removeNicknameOnDisconnect(socket);
  });
};

const updateNickname = (newNickname, id) => {
  usersOnline[id] = newNickname;
};

const onEmitNickName = (socket) => {
  socket.on('update-nickname', ({ nickname, oldNickname }) => {
    updateNickname(nickname, socket.id);
    socket.broadcast.emit('update-nickname', {
      nickname: usersOnline[socket.id],
      oldNickname,
    });
  });
};

module.exports = (io) => io.on('connection', (socket) => {
  newLoggedInUser(socket);
  message(socket, io);
  disconnect(socket);
  onEmitNickName(socket);
});