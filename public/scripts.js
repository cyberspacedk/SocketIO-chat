// соединяемся с пространством / при этом срабатвает событие connection
const socketAdmin = io("http://localhost:9000");

// объявим переменную, которая будет достпка везде в коде
let nsSocket = null;

socketAdmin.on("nsData", nameSpaces => {
  // размапим в DOM полученный массив с инфой о пространствах
  // получаем контейнер
  const nameSpaceContainer = document.querySelector(".namespaces");

  // маппим в разметку
  const spaceItem = nameSpaces
    .map(
      ({ img, endpoint }) =>
        `<div class="namespace" endpoint="${endpoint}"><img src="${img}"/></div>`
    )
    .join("");
  // вставляем в контейнер
  nameSpaceContainer.innerHTML = spaceItem;

  // вызываем коннект к пространству /wiki
  joinNs("/wiki");
});
