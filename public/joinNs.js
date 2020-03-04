function joinNs(endpoint) {
  // CLOSE PREVIOUS CONNECTION AND REMOVE EVENT LISTENER
  if (nsSocket) {
    nsSocket.close();
    document.querySelector("#messages").innerHTML = "";
    document.querySelector(".message-form").removeEventListener("submit", newMessage);
  }

  // STORE IN GLOBAL VARIABLE NEW CONNECTION
  nsSocket = io(`http://localhost:9000${endpoint}`);

  // LOADS ROOMS BELONGS TO NAMESPACE
  nsSocket.on("nsRoomLoad", nsRooms => {  
    // MAP ROOMS 
    const mappedRooms = nsRooms.map(({ roomTitle }) => `<li class="room"> <span class="glyphicon"></span> ${roomTitle} </li>`).join(""); 
    // SHOW THEM
    document.querySelector(".room-list").innerHTML = mappedRooms;

    // CHOOSE ALL ROOMS
    const rooms = [...document.querySelectorAll(".room")];

    // call joinRoom by click 
    rooms.forEach(room =>  room.addEventListener("click", e => joinRoom(e.target.innerText)));

    // join to first top room by default
    const topRoom = rooms[0];
    const topRoomName = topRoom.innerText; 
    joinRoom(topRoomName);
  });

  // GET MESSAGE FROM SERVER
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

  // SEND MESSAGE TO SERVER 
  document.querySelector(".message-form").addEventListener("submit", newMessage);
}

// FORM SUBMIT HANDLER
function newMessage(e) {
  e.preventDefault();
  const newMessage = document.querySelector("#user-message").value;
  if (!newMessage) return;
  nsSocket.emit("newMessageToServer", newMessage);
  e.target.reset();
}
 