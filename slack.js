const express = require("express");
const app = express();
const socketio = require("socket.io");

app.use(express.static(__dirname + "/public/chat.html"));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

// grab array of created namespaces
let namespaces = require("./data/namespaces");

// INITIAL CONNECTION
io.on("connection", socket => { 
  //  create an array with img and enpoint only
  let nameSpaceData = namespaces.map(({ img, endpoint }) => ({ img, endpoint })); 
  // send created array with data about namespaces to client
  socket.emit("nsData", nameSpaceData);
});

// ADD LISTENERS TO EACH NAMESPACES
namespaces.forEach(namespace => {
  // connect each namespace
  io.of(namespace.endpoint).on("connection", nsSocket => {
    const username = nsSocket.handshake.query.username; 
    // send to client all rooms belongs to the namespace
    nsSocket.emit("nsRoomLoad", namespace.rooms);

    // WORK WITH CONCERN ROOM
    //  listen what room is connected
    nsSocket.on("joinRoom", joinedRoom => {
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(namespace, roomToLeave);
      nsSocket.join(joinedRoom);

      // find data of this room among other rooms
      const nsRoom = joinedRoom &&
        namespace.rooms.find(item => item.roomTitle === joinedRoom.trim());

      // send to client found room chat history
      nsSocket.emit("historyCatchUp", nsRoom.history);

      // also send all active members of this room
      updateUsersInRoom(namespace, joinedRoom);
    });

    // LISTEN NEW MESSAGE
    nsSocket.on("newMessageToServer", message => {
      // при получении сообщения нужно выяснить какая комната его отправила
      // в nsSocket.rooms лежит объект в котором находится информация
      // о id пространства и о комнате
      const roomData = Object.keys(nsSocket.rooms);
      // получим ключи [ '/wiki#4Enhll3r0n6TU9-AAAAB', ' New Articles' ]

      // запишем в переменную имя комнаты
      const roomTitle = roomData[1];

      //  далее нужно сформировать ответ сообщения от сервера
      const fullMessage = {
        text: message,
        time: new Date(Date.now()).toLocaleString(),
        username,
        avatar: "https://via.placeholder.com/30"
      };

      // найдем ту самую комнату
      const nsRoom = roomTitle && namespace.rooms.find(
        item => item.roomTitle === roomTitle.trim()
      );

      // добавим в массив сообщений новое сообщение
      nsRoom.addMessage(fullMessage);

      // далее нужно отослать полученное сообщение в соответствующую комнату
      // выберем пространство, выберем комнату, эмитим сообщение
      io.of(namespace.endpoint).to(roomTitle).emit("messageToClients", fullMessage);
    });
  });
});

// HELPER FUNC
function updateUsersInRoom(namespace, joinedRoom) {
  io.of(namespace.endpoint).in(joinedRoom).clients((err, clients) => {
      io.of(namespace.endpoint).in(joinedRoom).emit("updateMembers", clients.length);
    });
}
