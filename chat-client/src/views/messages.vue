<template>
  <v-container fluid style="height: 100%" class="d-flex align-center justify-center">
    <v-row>
      <v-col cols="11" class="mx-auto">
        <v-card height="90vh" :style="{'background-color': $vuetify.theme.themes.light.lightBackground}"
                style="border-radius: 20px">
          <v-row>
            <v-col cols="3" lg="2" class="py-0 pr-0" v-if="showUsers">
              <v-card :style="{'background-color': $vuetify.theme.themes.light.background}"
                      style="border-radius: 20px 0 0 20px;overflow: auto" height="90vh"
                      class="pt-5 pb-2"
              >
                <div class="mx-3 mb-5 text-h6 white--text">User List</div>
                <v-list-item style="height: 10px;border-radius: 20px"
                             :style="{'background-color': $vuetify.theme.themes.light.lightBackground}"
                             class="mx-4 mb-3"
                             v-for="user in users"
                             :class="{'mr-0 ml-8 selectedUser' : user.username === selectedUser.username}"
                             :key="user.userID"
                             @click="changeUser(user)"
                >
                  <v-icon :color="isOnline(user.userID)" size="10">mdi-circle</v-icon>
                  <div class="ml-1">{{ user.name }}</div>
                  <v-icon class="ml-auto" v-if="user.haveNewMessage" size="20" color="secondary">mdi-message-alert</v-icon>
                </v-list-item>
              </v-card>
            </v-col>
            <v-col cols="9" lg="10" class="pl-0 pt-0" v-if="selectedUser.username != undefined">
              <div class="mx-3 py-5">
                <v-icon :color="isOnline(selectedUser.userID)" size="10">mdi-circle</v-icon>
                <div class="ml-1 d-inline-block">{{ selectedUser.name }}</div>
                <div class="ml-1 text-body-2 grey--text">@{{ selectedUser.username }}</div>
              </div>
              <v-divider/>
              <v-card height="76vh" style="background-color: transparent;overflow: auto"
                      class="mx-0 elevation-0 pt-6 scroller-style">
                <message v-for="message in messages" class="mb-5"
                         :is-seen="message.isSeen == 1 && message.fromUser == username"
                         :is-sent="message.isSeen == 0 && message.fromUser == username"
                         :message-time="message.time"
                         :class="{'ml-auto' : message.fromUser != selectedUser.username}"
                         :color="messageColor(message.fromUser)" :message="message.messageText"/>
              </v-card>
              <v-text-field style="background-color: white;border-radius: 0;border-radius: 0 0 10px 0" solo
                            class="elevation-0"
                            placeholder="your message..."
                            append-icon="mdi-send" @click:append="sendMessage" v-model="text" color="background"
                            :disabled="isOffline"></v-text-field>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Message from "@/components/message.vue";
import socket from "../socket"
import router from "@/router";

export default {
  components: {Message},
  data() {
    return {
      username: this.$store.getters.getUsername,
      isOffline: false,
      showUsers : true,
      selectedUser: {name : undefined,userID: undefined, username: undefined},
      text: "",
      messages: [],
      users: [
        {
          name : 'mahdi',
          userID: '46723dheydfeg',
          username: "mahdi_turrkk",
          haveNewMessage : true,
          messages: [
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "mahdi",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "ali",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "mahdi",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "ali",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "mahdi",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "ali",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "mahdi",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "mahdi",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "ali",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "mahdi",
            },
            {
              text: "xdcfvgbhjklokjhgvfcdxcfvbhjklkjhbgvfcdxsdcghjl;lkjnhbvfcdxsdfyuhujkkiju fyguhjkol[kijhygf rfygh lokiouyg tugyjklppihygt fryguhukok ihugvfc vghkoiuyu gtfyrguyokpuhiyutf kopijhygiyhu okiohyigutvuikoiyugt gyh okijuyuvb ljhyvioijhuyg",
              fromUsername: "mahdi",
            }
          ]
        },
        {
          userID: undefined,
          username: "ali"
        },
      ],
    };
  },
  methods: {
    sendMessage() {
      socket.emit("private message", {
        content : this.text,
        to: this.selectedUser,
      });
      const index = this.users.findIndex(object => {
        return object.username === this.selectedUser.username;
      });
      const date = new Date()
      const timeStamp = `${date.getFullYear()}/${date.getMonth() > 9 ? date.getMonth() : "0" + date.getMonth()}/${date.getDate() > 9 ? date.getDate() : "0" + date.getDate()}-${date.getHours() > 9 ? date.getHours() : "0" + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()}`
      this.users[index].messages.push({
        messageText : this.text,
        fromUser: this.username,
        time: timeStamp,
        isSeen : 0
      });
      this.text = undefined
    },
    changeUser(user) {
      this.selectedUser.username = user.username
      this.selectedUser.name = user.name
      this.selectedUser.userID = user.userID
      user.haveNewMessage = false
      this.messages = user.messages
      this.text = ''
      socket.emit('seen message' , {
        fromUser : user.username,
        toUser: this.username,
        fromUserID : user.userID
      });
    },
    messageColor(username) {
      if (username != this.selectedUser.username)
        return 'white'
      else
        return this.$vuetify.theme.themes.light.background
    },
    isOnline(id) {
      if (id != undefined)
        return 'green'
      else return 'red'
    },
  },
  created() {
    if(this.username == ''){
      alert('You are not logged in')
      router.push('/')
    }
    else {
      socket.on("connect", () => {
        this.isOffline = false
      });
      socket.on("disconnect", () => {
        this.isOffline = true
      });

      socket.on("users", (users) => {
        this.users = users.filter(user => user.username != this.username)
        for(let i = 0 ; i < this.users.length ; i++){
          let messages = users[i].messages
          messages = messages.filter(message => message.fromUser != this.username && message.isSeen == 0)
          if(messages.length > 0){
            users[i].haveNewMessage = true
          }
        }
      });

      socket.on("user connected", (user) => {
        const index = this.users.findIndex(object => {
          return object.username === user.username;
        });
        if (index == -1) {
          this.users.push({username: user.username, userID: user.userID , name : user.name, messages: []})
        } else {
          this.users[index].userID = user.userID
        }
        this.showUsers = false
        this.showUsers = true
      });

      socket.on("user disconnected", (id) => {
        const index = this.users.findIndex(object => {
          return object.userID === id;
        });
        this.users[index].userID = undefined
        this.showUsers = false
        this.showUsers = true
      });

      socket.on("private message", ({content, from}) => {
        const index = this.users.findIndex(object => {
          return object.username === from;
        });
        this.users[index].messages.push(content)
        this.users[index].haveNewMessage = true
        if(this.selectedUser.username == from){
          this.users[index].haveNewMessage = false
          socket.emit('seen message' , {
            fromUser : from,
            toUser: this.username,
            fromUserID : this.users[index].userID
          });
        }
        this.showUsers = false
        this.showUsers = true
      });

      socket.on('seen message' , ({user})=>{
        let messages = this.users.filter(obj => obj.username == user)
        messages = messages[0].messages.filter(obj => obj.fromUser == this.username && obj.isSeen == 0)
        for(let i = 0 ; i < messages.length ;i++)
          messages[i].isSeen = 1
      })
    }
  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
    socket.off("seen message");
  },
}
</script>

<style>
::-webkit-scrollbar {
  width: 0;
}

.scroller-style::-webkit-scrollbar {
  width: 8px;
}

.scroller-style::-webkit-scrollbar-track {
  border-radius: 10px;
}

.scroller-style::-webkit-scrollbar-thumb {
  background: #beb2ff;
  border-radius: 10px;
}

.scroller-style::-webkit-scrollbar-thumb:hover {
  background: #beb2ff;
}

.selectedUser {
  border-radius: 20px 0 0 20px !important;
}

</style>