function joinRoom(roomName) {
  // пошлем на сервер имя комнаты
  nsSocket.emit("joinRoom", roomName, newNumberOfMembers => {});

  nsSocket.on("updateMembers", countMembers => {
    // выберем из DOM элементы которы отображают имя комнаты и количество участников
    document.querySelector(".curr-room-text").innerText = roomName;

    const countOfMembers = document.querySelector(".curr-room-num-users");
    const countMarkup = `${countMembers} <span class="glyphicon glyphicon-user"></span>`;
    countOfMembers.innerHTML = countMarkup;
  });

  //  подписываемся на получение истории сообщений и мапим их в список
  nsSocket.on("historyCatchUp", history => {
    const renderMessageItem = ({ avatar, username, time, text }) =>
      ` <li>
        <div class="user-image">
            <img src=${avatar} />
        </div>
        <div class="user-message">
            <div class="user-name-time">${username}
                <span>${time}</span>
            </div>
            <div class="message-text">${text}</div>
        </div>
        </li>`;

    const chatHistory = history.map(item => renderMessageItem(item)).join("");
    const chatList = document.querySelector("#messages");
    chatList.innerHTML += chatHistory;

    // move to last message
    chatList.scrollTo(0, chatList.scrollHeight);
  });
}
