class Chat {
  constructor() {
    this.user = '';
    this.message = '';
    this.contentMessage = '';
    this.nickName = '';
    this.usersOnline = [];
    this.socket = window.io();

    this.getMessage = this.getMessage.bind(this);
    this.setNickName = this.setNickName.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.addEventBtnGetMessage = this.addEventBtnGetMessage.bind(this);
    this.addEventBtnSaveMyName = this.addEventBtnSaveMyName.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onLoadingDate = this.onLoadingDate.bind(this);
    
    this.main();
  }

  disconectUs() {
    this.socket.io.emit('disconnect');
  }

  static setNameInChat(nickName, idType = true) {
    const htmlWithNickName = (
      `<li class="name-user-logged">
        <span class="dot"></span>
        <span ${idType
          ? 'id="is-my-nick-name"'
          : 'class="is-other-nick-name"'
        }
        data-testid="online-user">
          ${nickName}
        </span>
      </li>`
    );
    return htmlWithNickName;
  }

  static addUserToOlineGroup(nickName) {
    const usersOnlineNickNameGroup = document.getElementById('online-user-nickname-group');
    const htmlWithNickName = Chat.setNameInChat(nickName, false);
    usersOnlineNickNameGroup.insertAdjacentHTML('beforeend', htmlWithNickName);
  }

  myNicknameAtTheBeginningOfTheList() {
    const usersOnlineNickNameGroup = document.getElementById('online-user-nickname-group');
    usersOnlineNickNameGroup.insertAdjacentHTML('afterbegin', Chat.setNameInChat(this.nickName));
  }

  createNickNameRandomInitial() {
    const LENGTH = 11;
    let nameTemp = 'User-';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let indice = 0; indice < LENGTH; indice += 1) {
      nameTemp += possible.charAt(Math.floor(Math.random() * possible.length));
    } 
    this.nickName = nameTemp;
    this.myNicknameAtTheBeginningOfTheList();
  }
  
  getMessage() {
    const message = document.getElementById('text-message');
    this.message = message.value;
  }
  
  setNickName() {
    const nickTemp = this.nickName;
    const myNickName = document.getElementById('is-my-nick-name');
    const saveName = document.getElementById('setMyName');
    this.nickName = saveName.value;
    myNickName.innerText = this.nickName;
    this.socket.emit('update-nickname', {
      nickname: this.nickName,
      oldNickname: nickTemp,
    });
  }

  static setMessageChat(date, nickName, message) {
    const getChat = document.getElementById('container-web-chat');
    const createContainerMessage = (
      `<div class="container-message">
        <div class="date-message">
          <span>${date}</span>
        </div>
        <div class="name-user">
          <span>${nickName}</span>
        </div>
        <div class="content-message">
          <p data-testid="message">
            ${nickName} <br> ${message}
          </p>
        </div>
      </div>`
    );
    getChat.insertAdjacentHTML('beforeend', createContainerMessage);
  }

  addEventBtnSaveMyName() {
    const getName = document.getElementById('saveMyName');
    getName.addEventListener('click', this.setNickName);
  }

  sendMessage() {
    this.getMessage();
    this.socket.emit('message', {
      chatMessage: this.message,
      nickname: this.nickName });
  }
    
  static splitMessage(message) {
    const cutDateRegex = new RegExp(/\d{1,2}-\d{1,2}-\d{4}/y);
    const cutDate = message.match(cutDateRegex);
    
    const cutHoursRegex = new RegExp(/\d{1,2}:\d{1,2}(:\d{0,2})?\s(PM|AM)?/gm);
    const cutHours = message.match(cutHoursRegex);
    
    const cutNameRegex = new RegExp(/([PM|AM]\s-\s)([\w\s\S]*:)/);
    const cutName = message.match(cutNameRegex);
    const replacerName = cutName[2].replace(':', '');

    const cutMessageRegex = new RegExp(/((^.*-\s[\w\s\S]*?:)[\s\S.]*?)$/);
    const cutMessage = message.match(cutMessageRegex);
    const replCutMessage = message.replace(`${cutMessage[2]} `, '');
    
    return { date: `${cutDate} ${cutHours}`, message: replCutMessage, nickname: replacerName };
  }

  addEventBtnGetMessage() {
    const getMessage = document.getElementById('send-message-chat');
    getMessage.addEventListener('click', () => this.sendMessage());
  }

  static eventScrolled() {
    const element = document.getElementById('container-web-chat');
    if (element.scrollTop + element.clientHeight !== element.scrollHeight) {
      element.scrollTop = element.scrollHeight;
    }
  }

  onMessage() {
    this.socket.on('message', (message) => {
      const data = Chat.splitMessage(message);
      Chat.setMessageChat(data.date, data.nickname, data.message);
      Chat.eventScrolled();
    });
  }

  emitUserLogged() {
    this.socket.emit('newLoggedInUser', this.nickName);
  }

  onUserLogged() {
    this.socket.on('newLoggedInUser', (nickname) => {
      Chat.addUserToOlineGroup(nickname);
    });
  }

  static loadMessageHistory(messages) {
    if (messages.length) {
      messages.forEach((element) => {
        const data = Chat.splitMessage(element);
        Chat.setMessageChat(data.date, data.nickname, data.message);
      });
    }
  }

  getUser(data) {
    Chat.loadMessageHistory(data.messages);
    this.usersOnline.push(...data.nickname);
    const myIndex = this.usersOnline.indexOf(this.nickName);
    if (myIndex > -1) {
      console.log(myIndex);
      this.usersOnline.splice(myIndex, 1);
    }
    this.usersOnline.map(Chat.addUserToOlineGroup);
  }

  onLoadingDate() {
    this.socket.on('loadingMsgAndUsersLogged', (data) => {
      this.getUser(data);
    });
  }

  static getHtmlUser(nickname) {
    const getGroupUser = document.getElementsByClassName('is-other-nick-name');
    const arrUsers = Array.from(getGroupUser);
    const htmlUser = arrUsers.find((el) => el.innerText === nickname);
    return htmlUser;
  }

  static removeOfflineUserNickname(nickname) {
    const htmlUser = this.getHtmlUser(nickname);
    const parentUser = htmlUser.parentElement;
    parentUser.parentElement.removeChild(parentUser);
  }

  onOfflineUser() {
    this.socket.on('removed-user', (nickname) => {
      Chat.removeOfflineUserNickname(nickname);
    });
  }

  onUpdateNicknameOtherClient() {
    this.socket.on('update-nickname', ({ nickname, oldNickname }) => {
      const htmlUser = Chat.getHtmlUser(oldNickname);
      htmlUser.innerText = nickname;
    });
  }

  main() {
    this.onMessage();
    this.createNickNameRandomInitial();
    this.addEventBtnGetMessage();
    this.addEventBtnSaveMyName();
    this.emitUserLogged();
    this.onUserLogged();
    this.onLoadingDate();
    Chat.eventScrolled();
    this.disconectUs();
    this.onOfflineUser();
    this.onUpdateNicknameOtherClient();
  }
}

export default new Chat();