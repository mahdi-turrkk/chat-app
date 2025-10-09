<template>
  <div class="h-[100dvh] w-[100dvw] bg-gray-300 flex">
    <div class="fixed md:relative md:flex w-full z-20 md:w-1/3 lg:w-3/12 bg-gray-200 h-full max-h-[100dvh] flex-col"
         :class="showUserMenu ? '' : 'hidden'">
      <div class="px-6 py-5 bg-white shadow-xl flex justify-between items-center">
        <h1 class="text-blue-400 text-xl font-bold">
          Chat App
        </h1>
        <i class="pi pi-cog cursor-pointer hover:scale-125 transition-all duration-300"
           @click="showEditProfileImage = true"/>
      </div>
      <div class="flex-1 overflow-y-auto usersContainer">
        <div v-for="user in users" :key="user.userID" class="flex items-center gap-2 py-4 px-2 shadow hover:bg-gray-100"
             :class="user.username === selectedUser.username ? 'bg-gray-50' : ''"
             @click="changeUser(user)">
          <div class="rounded-full relative w-10 h-10 text-white flex justify-center items-center font-bold text-lg "
               :class="`bg-${colors[(user.name.charCodeAt(0) + user.name.charCodeAt(1)) % 7]}`">
            <div
                class="rounded-full relative w-10 h-10 text-white flex justify-center items-center font-bold text-lg overflow-hidden">
              <img :src="`${backendUrl}/api/files/${user.profileImage}?fileType=profile`"
                   v-if="user.profileImage" :alt="user.name"/>
            </div>
            {{ user.profileImage ? '' : user.name.slice(0, 2) }}
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
            <div
                class="rounded-full relative w-10 h-10 text-white flex justify-center items-center font-bold text-lg overflow-hidden">
              <img :src="`${backendUrl}/api/files/${selectedUser.profileImage}?fileType=profile`"
                   v-if="selectedUser.profileImage" :alt="selectedUser.name"/>
            </div>
            {{ selectedUser.profileImage ? '' : selectedUser.name.slice(0, 2) }}
          </div>
          <div class="text-blue-400 text-lg font-bold">
            {{ selectedUser.name }}
            <div class="text-gray-500 text-xs font-normal">
              {{ selectedUser.userID ? 'online' : 'Last Seen Recently' }}
            </div>
          </div>
          <div class="ml-auto">
            <i class="pi pi-times hover:scale-125 transition-all duration-300"
               @click="() => {showUserMenu = true ; selectedUser.name = undefined;selectedUser.id = undefined}"/>
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
                   :isMe="message.fromUser === id" :message="message"/>
          <div id="last"></div>
        </div>
        <div class="flex gap-2 mx-2 p-2 bg-white rounded-lg mb-1" v-if="files.length">
          <div class="relative" v-for="(file,index) in files">
            <img :src="getUrl(file)" class="w-20 h-20 object-cover rounded-lg"/>
            <button class="-top-1 -right-1 absolute rounded-full bg-white shadow-lg w-4 h-4 cursor-pointer" @click="removeFile(index)" :disabled="isSending">
              <i class="pi pi-times-circle text-red-500"/>
            </button>
          </div>
        </div>
        <div class="flex bg-gray-400/40">
          <input placeholder="Message" class="grow h-14 px-2 focus:outline-0" v-model="text" :disabled="isSending"
                 @keyup.enter="sendMessage"/>
          <button class="flex justify-center items-center px-2 cursor-pointer" @click="fileInput.click()" :disabled="isSending">
            <i class="pi pi-paperclip text-lg text-blue-500"/>
          </button>
          <button class="flex justify-center items-center px-2 mr-2 cursor-pointer " :disabled="!(text || files.length) || isSending" @click="sendMessage">
            <i class="pi pi-send  text-lg" :class="text || files.length ? 'text-blue-500' : 'text-gray-500'" v-if="!isSending"/>
            <span class="loader animate-spin" v-else/>
          </button>
          <input class="hidden" type="file" ref="fileInput" multiple @change="imageChanged">
        </div>
      </div>
    </div>
    <change-user-info-modal :show-edit-profile="showEditProfileImage" @close="showEditProfileImage = false" :name="name"
                            :profile-image="profileImage"
                            @user-edited="(n,pi) => {name = n;profileImage = pi;showEditProfileImage = false}"
    />
  </div>
</template>
<script setup>
import socket from "../socket"
import router from "../router";
import {nextTick, onMounted, onUnmounted, ref} from "vue";
import axios from "axios";
import Message from "../components/message.vue";
import colors from "../helpers/staticData.js";
import ChangeUserInfoModal from "../components/changeUserInfoModal.vue";

const backendUrl = import.meta.env.VITE_BACKEND_URL
const showUserMenu = ref(true)
const showEditProfileImage = ref(false)
const username = ref("")
const id = ref(0)
const profileImage = ref('')
const name = ref('')
const isOffline = ref(false)
const selectedUser = ref({name: undefined, userID: undefined, username: undefined})
const text = ref("")
const fileInput = ref(null)
const files = ref([])
const messages = ref("")
const users = ref([])
const isSending = ref(false)

axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
  headers: {
    Authorization: localStorage.getItem("token")
  }
}).then(res => {
  username.value = res.data.username;
  name.value = res.data.name;
  profileImage.value = res.data.profileImage;
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

const sendMessage = async () => {
  isSending.value = true
  let filePaths = []
  if(files.value.length > 0) {
    let reqBody = new FormData()
    for(let i=0;i< files.value.length;i++){
      console.log(i)
      reqBody.append("files" , files.value[i], files.value[i].name)
    }
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/file/upload`,reqBody ,{
      headers: {
        Authorization: localStorage.getItem("token")
      }
    }).then(res => {
      filePaths = res.data.filePaths
    })
  }
  console.log(filePaths)
  socket.emit("private message", {
    content: text.value,
    to: selectedUser.value,
    files: filePaths,
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
    isSeen: 0,
    files: filePaths
  });
  text.value = undefined
  files.value = []
  isSending.value = false
  window.location.href = "#last"
}


const changeUser = (user) => {
  Object.assign(selectedUser.value, user)
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

const imageChanged = (e) => {
  files.value = Array.from(e.target.files)
  files.value = files.value.slice(0,10)
}

const getUrl = (file) => {
  return URL.createObjectURL(file)
}

const removeFile = (index) => {
  files.value.spFlice(index,1)
}

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