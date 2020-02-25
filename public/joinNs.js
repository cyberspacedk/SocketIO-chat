function joinNs(endpoint) {
  // соединимся с пространством по endpoint
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

    // выберем комнаты
    const rooms = [...document.querySelectorAll(".room")];

    rooms.forEach(room => {
      room.addEventListener("click", e => console.log(e));
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
}

// выберем форму, обработаем событие сабмита и получим значение инпута
document.querySelector(".message-form").addEventListener("submit", e => {
  e.preventDefault();
  const newMessage = document.querySelector("#user-message").value;
  // отправим сообщение на сервер
  nsSocket.emit("newMessageToServer", newMessage);
  e.target.reset();
});
