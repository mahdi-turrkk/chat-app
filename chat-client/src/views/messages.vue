<template>
  <div class="h-[100dvh] w-[100dvw] bg-gray-300 flex">
    <div class="fixed md:relative md:flex w-full z-20 md:w-1/3 lg:w-3/12 bg-gray-200 h-full max-h-[100dvh] flex-col"
         :class="showUserMenu ? '' : 'hidden'">
      <div class="px-6 py-5 bg-white shadow-xl">
        <h1 class="text-blue-400 text-xl font-bold">
          Chat App
        </h1>
      </div>
      <div class="flex-1 overflow-y-auto usersContainer">
        <div v-for="user in users" :key="user.userID" class="flex items-center gap-2 py-4 px-2 shadow hover:bg-gray-100"
             :class="user.username === selectedUser.username ? 'bg-gray-50' : ''"
             @click="changeUser(user)">
          <div class="rounded-full relative w-10 h-10 text-white flex justify-center items-center font-bold text-lg"
               :class="`bg-${colors[(user.name.charCodeAt(0) + user.name.charCodeAt(1)) % 7]}`">
            {{ user.name.slice(0, 2) }}
            <i v-if="user.userID" class="pi pi-circle-fill text-sm absolute bottom-0 right-0"
               :class="user.userID ? 'text-green-500' : ''"/>
          </div>
          <div>{{ user.name }}</div>
          <i class="pi pi-circle-fill text-blue-400 text-xl ml-auto" v-if="user.haveNewMessage"/>
        </div>
      </div>
    </div>
    <div class="w-full md:w-2/3 lg:w-9/12" v-if="selectedUser.name">
      <div class="flex flex-col flex-1 h-[100dvh]">
        <div class="px-6 py-3 bg-white shadow-xl flex gap-2 items-center">
          <div class="md:hidden flex items-center">
            <i class="pi pi-bars" @click="showUserMenu = true"/>
          </div>
          <div class="rounded-full relative w-10 h-10 text-white flex justify-center items-center font-bold text-sm"
               :class="`bg-${colors[(selectedUser.name.charCodeAt(0) + selectedUser.name.charCodeAt(1)) % 7]}`">
            {{ selectedUser.name.slice(0, 2) }}
          </div>
          <div class="text-blue-400 text-lg font-bold">
            {{ selectedUser.name }}
            <div class="text-gray-500 text-xs font-normal">
              {{ selectedUser.userID ? 'online' : 'Last Seen Recently' }}
            </div>
          </div>
        </div>
        <div class="flex-1 grow overflow-y-auto mt-2 messagesContainer">
          <div class="flex h-full justify-center items-center" v-if="messages.length === 0">
            <div class="w-fit px-3 py-1 rounded-2xl bg-white/30 text-sm text-gray-500">
              There is no message
            </div>
          </div>
          <message v-for="message in messages" class="mb-5"
                   :is-seen="message.isSeen === 1 && message.fromUser === id"
                   :is-sent="message.isSeen === 0 && message.fromUser === id"
                   :message-time="message.time"
                   :class="{'ml-auto' : message.fromUser === id}"
                   :isMe="message.fromUser === id" :message="message.messageText"/>
          <div id="last"></div>
        </div>
        <div class="flex bg-gray-400/40">
          <input placeholder="Message" class="grow h-14 px-2 focus:outline-0" v-model="text"
                 @keyup.enter="sendMessage"/>
          <button class="flex justify-center items-center px-4" :disabled="!text" @click="sendMessage">
            <i class="pi pi-send  text-lg" :class="text ? 'text-blue-500' : 'text-gray-500'"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import socket from "../socket"
import router from "../router";
import {nextTick, onMounted, onUnmounted, ref} from "vue";
import axios from "axios";
import Message from "../components/message.vue";

const colors = ['orange-500', 'yellow-500', 'sky-500', 'indigo-500', 'purple-500', 'pink-500']
const showUserMenu = ref(true)
const username = ref("")
const id = ref(0)
const isOffline = ref(false)
const selectedUser = ref({name: undefined, userID: undefined, username: undefined})
const text = ref("")
const messages = ref("")
const users = ref([])

axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
  headers: {
    Authorization: localStorage.getItem("token")
  }
}).then(res => {
  username.value = res.data.username;
  id.value = String(res.data.id);
  if (username.value === '') {
    localStorage.removeItem("token")
    router.push('/')
  } else {
    if (!socket.connected) {
      socket.auth = {token: localStorage.getItem("token")};
      socket.connect();
    }
    socket.on("connect", () => {
      isOffline.value = false
    });
    socket.on("disconnect", () => {
      isOffline.value = true
    });

    socket.on("users", (usersList) => {
      usersList.map(item => item.id = String(item.id))
      users.value = usersList.filter(user => user.id !== id.value)
      for (let i = 0; i < users.value.length; i++) {
        let messages = users.value[i].messages
        messages = messages.filter(message => message.fromUser !== id.value && message.isSeen === 0)
        if (messages.length > 0) {
          users.value[i].haveNewMessage = true
        }
      }
    });
    socket.on("user connected", (user) => {
      const index = users.value.findIndex(object => object.id === String(user.id));
      if (index === -1 && user.id !== id.value) {
        users.value.push({id: user.id, username: user.username, userID: user.userID, name: user.name, messages: []})
      } else if (user.id !== id.value) {
        users.value[index].userID = user.socketID
        if (selectedUser.value.id === users.value[index].id)
          selectedUser.value.userID = user.socketID;
      }
    });

    socket.on("user disconnected", (id) => {
      const index = users.value.findIndex(object => object.userID === id);
      if (selectedUser.value.id === users.value[index].id)
        selectedUser.value.userID = undefined;
      if (index !== -1)
        users.value[index].userID = undefined
    });

    socket.on("private message", ({content, from}) => {
      const index = users.value.findIndex(object => object.id === String(from));
      console.log(index)
      users.value[index].messages.push(content)
      users.value[index].haveNewMessage = true
      if (selectedUser.value.id === String(from)) {
        nextTick(() => {
          window.location.href = "#last"
        })
        users.value[index].haveNewMessage = false
        socket.emit('seen message', {
          fromUser: from,
          toUser: id.value,
          fromUserID: users.value[index].userID
        });
      }
    });

    socket.on('seen message', ({user}) => {
      let messages = users.value.filter(obj => obj.id === String(user))
      messages = messages[0].messages.filter(obj => obj.fromUser === id.value && obj.isSeen === 0)
      for (let i = 0; i < messages.length; i++)
        messages[i].isSeen = 1
    })
  }
}).catch(() => {
  localStorage.removeItem("token")
  router.replace("/")
})

const sendMessage = () => {
  socket.emit("private message", {
    content: text.value,
    to: selectedUser.value,
  });
  const index = users.value.findIndex(object => {
    return object.id === selectedUser.value.id;
  });
  const date = new Date()
  const timeStamp = `${date.getFullYear()}/${date.getMonth() > 9 ? date.getMonth() : "0" + date.getMonth()}/${date.getDate() > 9 ? date.getDate() : "0" + date.getDate()}-${date.getHours() > 9 ? date.getHours() : "0" + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()}`
  users.value[index].messages.push({
    messageText: text.value,
    fromUser: id.value,
    time: timeStamp,
    isSeen: 0
  });
  text.value = undefined
  window.location.href = "#last"
}


const changeUser = (user) => {
  selectedUser.value.username = user.username
  selectedUser.value.id = user.id
  selectedUser.value.name = user.name
  selectedUser.value.userID = user.userID
  user.haveNewMessage = false
  messages.value = user.messages
  nextTick(() => {
    window.location.href = "#last"
    showUserMenu.value = false
  })
  text.value = ''
  socket.emit('seen message', {
    fromUser: user.id,
    toUser: id.value,
    fromUserID: user.userID
  });
}

onMounted(() => {
  if (!localStorage.getItem("token")) {
    router.replace("/")
  }
})

onUnmounted(() => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("users");
  socket.off("user connected");
  socket.off("user disconnected");
  socket.off("private message");
  socket.off("seen message");
})

</script>

<style>
.usersContainer::-webkit-scrollbar {
  width: 0;
}

.messagesContainer::-webkit-scrollbar {
  width: 8px;
}

/* Track */
.messagesContainer::-webkit-scrollbar-track {
  background: var(--color-gray-400);
  border-radius: 5px;
}

/* Handle */
.messagesContainer::-webkit-scrollbar-thumb {
  background: var(--color-gray-500);
  border-radius: 10px;
}

/* Handle on hover */
.messagesContainer::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-600);
}
</style>