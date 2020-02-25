const express = require("express");
const app = express();
const socketio = require("socket.io");

// забираем массив созданных комнат
let namespaces = require("./data/namespaces");

app.use(express.static(__dirname + "/public/chat.html"));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

io.on("connection", socket => {
  // создадим массив данных в котором будет лежать enpoint и картинка пространства
  // итерируем имеющийся массив и забираем нужные данные
  let nameSpaceData = namespaces.map(({ img, endpoint }) => ({
    img,
    endpoint
  }));

  // отправляем сформированный массив на клиент
  socket.emit("nsData", nameSpaceData);
});

// пройдемся по массиву пространств и соединимся (установим слушателя) с пространсвами
namespaces.forEach(namespace => {
  // в of() попадет имя пространства /wiki /linux /mozilla
  io.of(namespace.endpoint).on("connection", nsSocket => {
    // высылаем на клиент список комнат
    nsSocket.emit("nsRoomLoad", namespaces[0].rooms);

    // слушаем какая комната присоединилась
    nsSocket.on("joinRoom", joinedRoom => {
      nsSocket.join(joinedRoom);

      // найдем ту самую комнату
      const nsRoom = namespace.rooms.find(
        item => item.roomTitle === joinedRoom.trim()
      );

      // отправим на клиент историю сообщений
      nsSocket.emit("historyCatchUp", nsRoom.history);

      // также отправим всем участникам комнаты количество участников
      io.of("/wiki")
        .in(joinedRoom)
        .clients((err, clients) => {
          io.of("/wiki")
            .in(joinedRoom)
            .emit("updateMembers", clients.length);
        });
    });

    // слушаем событие нового сообщения
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
        username: "some username",
        avatar: "https://via.placeholder.com/30"
      };

      // найдем ту самую комнату
      const nsRoom = namespace.rooms.find(
        item => item.roomTitle === roomTitle.trim()
      );

      // добавим в массив сообщений новое сообщение
      nsRoom.addMessage(fullMessage);

      // далее нужно отослать полученное сообщение в соответствующую комнату
      // выберем пространство, выберем комнату, эмитим сообщение
      io.of("/wiki")
        .to(roomTitle)
        .emit("messageToClients", fullMessage);
    });
  });
});
