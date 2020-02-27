function joinNs(endpoint) {
  // CLOSE PREVIOUS CONNECTION AND REMOVE EVENT LISTENER
  if (nsSocket) {
    nsSocket.close();
    document.querySelector("#messages").innerHTML = "";
    document
      .querySelector(".message-form")
      .removeEventListener("submit", newMessage);
  }

  // NEW CONNECTION
  nsSocket = io(`http://localhost:9000${endpoint}`);

  // когда приозойдет соединение с сервера выстрелится событие nsRoomLoad
  // которое эмитит массив комнат пространства
  nsSocket.on("nsRoomLoad", nsRooms => {
    // выберем элемент для отрисовки списка комнат
    const roomList = document.querySelector(".room-list");

    // размапим комнаты в разметку
    const mappedRooms = nsRooms
      .map(({ roomTitle, privateRoom }) => {
        let icon = privateRoom ? "lock" : "globe";

        return `<li class="room">
                   <span class="glyphicon glyphicon-${icon}"></span>
                  ${roomTitle}
               </li>`;
      })
      .join("");

    // отобразим список комнат
    roomList.innerHTML = mappedRooms;

    // CHOOSE ALL ROOMS
    const rooms = [...document.querySelectorAll(".room")];

    // call joinRoom with concern room
    rooms.forEach(room => {
      room.addEventListener("click", e => joinRoom(e.target.innerText));
    });

    // получим имя комнаты пространтсва
    const topRoom = rooms[0];
    const topRoomName = topRoom.innerText;

    joinRoom(topRoomName);
  });

  // получим сообщения с сервера и отобразим
  nsSocket.on("messageToClients", message => {
    const messageItem = ` <li>
                            <div class="user-image">
                                <img src=${message.avatar} />
                            </div>
                            <div class="user-message">
                                <div class="user-name-time">${message.username} 
                                  <span id="time" class="badge badge-warning">${message.time}</span> 
                                </div>
                                <div class="message-text">${message.text}</div>
                            </div>
                        </li>`;

    document.querySelector("#messages").innerHTML += messageItem;
  });
  document
    .querySelector(".message-form")
    .addEventListener("submit", newMessage);
}

// выберем форму, обработаем событие сабмита и получим значение инпута
function newMessage(e) {
  e.preventDefault();
  const newMessage = document.querySelector("#user-message").value;
  if (!newMessage) return;
  // отправим сообщение на сервер
  nsSocket.emit("newMessageToServer", newMessage);
  e.target.reset();
}
