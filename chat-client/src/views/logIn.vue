<template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh">
    <v-card width="500px" color="grey" class="lighten-3 px-6 py-9 text-center" style="border-radius: 20px">
      <v-window v-model="onboarding">
        <v-window-item>
          <div class="text-center text-h4 secondary--text">Sign In</div>
          <v-text-field solo v-model="username" placeholder="username" class="mt-6"
                        style="border-radius: 10px"></v-text-field>
          <v-text-field v-model="password" :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="showPass ? 'text' : 'password'"
                        @click:append="showPass = !showPass"
                        placeholder="password"
                        solo
                        style="border-radius: 10px"
          ></v-text-field>
          <v-btn color="primary" style="border-radius: 10px" width="80%" @click="signIn">
            sign In
          </v-btn>
          <div class="text-subtitle-1 primary--text text-center mt-3" @click="onboarding = 1"
               style="cursor: pointer">Don't have an account? create one
          </div>
        </v-window-item>
        <v-window-item>
          <div class="text-center text-h4 secondary--text">Sign Up</div>
          <v-text-field solo v-model="name" placeholder="name" class="mt-6"
                        style="border-radius: 10px"></v-text-field>
          <v-text-field solo v-model="username" placeholder="username" class="mt-n2"
                        style="border-radius: 10px"></v-text-field>
          <v-text-field v-model="password" :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="showPass ? 'text' : 'password'"
                        @click:append="showPass = !showPass"
                        placeholder="password"
                        solo
                        style="border-radius: 10px"
                        class="mt-n2"
          ></v-text-field>
          <v-btn color="primary" style="border-radius: 10px" width="80%" @click="signUp">
            sign up
          </v-btn>
          <div class="text-subtitle-1 primary--text text-center mt-3" @click="onboarding = 0"
               style="cursor: pointer">Have an account? log in
          </div>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script>
import socket from "../socket"
import router from "@/router";
import axios from "axios";

export default {
  name: 'signPage',
  data() {
    return {
      showPass: false,
      onboarding: 0,
      name: undefined,
      username: undefined,
      password: undefined,
    }
  },
  methods: {
    signIn() {
      axios.post('http://localhost:4000/api/login', {
        username: this.username,
        password: this.password,
      }).then(response => {
        let username = this.username
        socket.auth = {username};
        socket.connect();
        this.$store.commit('setUsername' , this.username)
        router.push('/messaging')
      })
          .catch(error => {
            alert(error)
          });
    },
    signUp() {
      axios.post('http://localhost:4000/api/register', {
        name: this.name,
        username: this.username,
        password: this.password,
      }).then(response => {
        this.username = undefined
        this.password = undefined
        this.name = undefined
        this.onboarding = 0
        alert('User Created')
      }).catch(error => {
        alert(error)
      });
    }
  },
  created() {
    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        this.usernameAlreadySelected = false;
      }
    });
  },
  destroyed() {
    socket.off("connect_error");
  },
}
</script>