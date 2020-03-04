// ask user his username
let username= prompt('Type your name.') || 'anonymous';  

// INITIAL CONNECT + pass object with username
const socketAdmin = io("http://localhost:9000", {query: { username }});

// DEFINE GLOBAL VARIABLE
let nsSocket = null;

socketAdmin.on("nsData", nameSpaces => {
  // MAP GETTING NAMESPACE ARRAY FROM SERVER
  const spaceItem = nameSpaces .map( ({ img, endpoint }) => (
    `<div class="namespace" endpoint="${endpoint}"><img src="${img}"/></div>`)).join("");

  document.querySelector(".namespaces").innerHTML = spaceItem;

  // ADD LISTENER FOR CLICK ON NAMESPACE
  // 1. select all namespaces
  // 2. add to each event click listener
  // 3. get endpoint of clicked namespace
  // 4. connect with this namespace by calling joinNs func
  [...document.querySelectorAll(".namespace")].forEach(namespace => {
    namespace.addEventListener("click", () => {
      const nsEndpoint = namespace.getAttribute("endpoint"); 
      joinNs(nsEndpoint);
    });
  });
  // initial join by default
  joinNs('/wiki')
});
