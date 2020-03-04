function joinRoom(roomName) {
  // when room connected SEND to server its name
  nsSocket.emit("joinRoom", roomName, newNumberOfMembers => {});

  // SET TO UI CURRENT ROOM NAME AND COUNT OF MEMBERS
  nsSocket.on("updateMembers", countMembers => {
    document.querySelector(".curr-room-text").innerText = roomName;
    document.querySelector(".curr-room-num-users").innerHTML = `Active users ${countMembers}`;;
  });

  //  GET HISTORY FROM SERVER AND MAP TO HTML
  nsSocket.on("historyCatchUp", history => {
    const renderMessageItem = ({ avatar, username, time, text }) =>
      ` <li>
        <div class="user-image">
            <img src=${avatar} />
        </div>
        <div class="user-message">
            <div class="user-name-time">${username}
                <span id="time" class="badge badge-warning">${time}</span>
            </div>
            <div class="message-text">${text}</div>
        </div>
        </li>`;

    const chatHistory = history.map(item => renderMessageItem(item)).join("");
    const chatList = document.querySelector("#messages");
    chatList.innerHTML = chatHistory;

    // scroll page to last message
    chatList.scrollTo(0, chatList.scrollHeight);
  });
}
