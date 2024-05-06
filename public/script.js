document.addEventListener("DOMContentLoaded", function (e) {
  fetch("https://royalchatting.netlify.app/.netlify/functions/server").then(response=>response).then((response)=>{console.log(response.status)})
  // const socket = io("http://localhost:8000");
  // const socket = io("/.netlify/functions/server");
  const socket = io(".netlify/functions/server/socket.io");
  // const socket = io()
  const messagecontainer = document.querySelector(".container");
  const form = document.getElementById("send-container");
  const messageinput = document.getElementById("messageinp");
  const currentmembers = document.getElementById("CurrentMembers");
  let audio = new Audio("./notification.mp3");
  const scrollToBottom = () => {
    messagecontainer.scrollTop = messagecontainer.scrollHeight;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageinput.value;
    append(`You : ${message}`, "messageSent");
    socket.emit("send", message);
    messageinput.value = "";
  });

  //   let username = prompt("Enter Your Name:");
  const savedname = localStorage.getItem("name");
  console.log("Saved name: " + savedname);
  let username;
  if (!savedname || savedname === "null") {
    username = prompt("Enter Your Name:");
    localStorage.setItem("name", username);
  } else {
    username = savedname;
  }
  socket.emit("new-user-joined", username);

  const members = {};

  const updateMembersList = (memberList) => {
    currentmembers.innerHTML = "";
    memberList.forEach((member) => {
      const memberElement = document.createElement("li");
      memberElement.textContent = member;
      currentmembers.appendChild(memberElement);
    });
  };

  const append = (message, position) => {
    const messageElement = document.createElement("div");
    messageElement.innerHTML = message;
    messageElement.classList.add("message");
    messageElement.classList.add(position);
   messageElement.classList.add('animation');

   messagecontainer.appendChild(messageElement);

   messageElement.style.transition = 'transform .1ms ease';
   setTimeout(() => {
       messageElement.classList.remove('animation');
   }, 1000);

    if (position === "messageReceived") {
      audio.play();
    }
    scrollToBottom();
  };
  socket.on("user-joined", (user) => {
    append(`${user} joined the chat`, "Joined");
    members[user] = user;
    updateMembersList(Object.values(members));
  });
  socket.on("recieve", (data) => {
    append(`${data.name} : ${data.message}`, "messageReceived");
  });
  socket.on("leave", (user) => {
    append(`${user} left the chat`, "leave");
    delete members[user];
    updateMembersList(Object.values(members));
  });

  socket.on("current-members", (currentMembers) => {
    currentMembers.forEach((member) => {
      members[member] = member;
    });
    updateMembersList(currentMembers);
  });
});
