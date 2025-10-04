<template>
  <div class="h-[100dvh] w-[100vw] bg-gray-300">
    <slider :data="[{},{}]" :hide-slide-indicators="true" :auto-scroll="false" :onboarding-slide="onboarding"
            :hide-navigators="true">
      <template v-slot:slide0>
        <div class="flex justify-center items-center h-full">
          <div class="bg-white rounded-xl min-w-[30%] p-8 shadow-xl">
            <div class="text-center text-3xl font-black text-blue-400">Sign In</div>
            <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
                   v-model="username" placeholder="Username">
            <div class="relative">
              <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
                     v-model="password" placeholder="Password" :type="showPass ? 'text' : 'password'"
                     @keyup.enter="signIn">
              <i class="pi absolute right-3 top-9 text-lg text-blue-400 cursor-pointer"
                 :class="showPass ? 'pi-eye-slash' : 'pi-eye'" @click="showPass = !showPass"/>
            </div>
            <button
                class="h-10 flex justify-center items-center w-full bg-blue-400 hover:bg-blue-300 focus:bg-blue-500 disabled:bg-blue-100 cursor-pointer rounded-xl mt-6 text-white"
                @click="signIn">
              Sign In
            </button>
            <div class="text-sm text-blue-400 text-center mt-3" @click="onboarding = 1"
                 style="cursor: pointer">Don't have an account? create one
            </div>
          </div>
        </div>
      </template>
      <template v-slot:slide1>
        <div class="flex justify-center items-center h-full">
          <div class="bg-white rounded-xl min-w-[30%] p-8 shadow-xl">
            <div class="text-center text-3xl font-black text-blue-400">Sign Up</div>
            <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
                   v-model="name" placeholder="Name">
            <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
                   v-model="username" placeholder="Username">
            <div class="relative">
              <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
                     v-model="password" placeholder="Password" :type="showPass ? 'text' : 'password'"
                     @keyup.enter="signUp">
              <i class="pi absolute right-3 top-9 text-lg text-blue-400 cursor-pointer"
                 :class="showPass ? 'pi-eye-slash' : 'pi-eye'" @click="showPass = !showPass"/>
            </div>
            <div class="relative cursor-pointer">
              <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
                     :value="profileImage?.name" placeholder="Profile Image" disabled>
              <div class="absolute top-0 right-0 left-0 bottom-0" @click="fileInput.click()"></div>
            </div>
            <input class="hidden" type="file" accept="image/png , image/jpeg, image'jpg" ref="fileInput" @change="(e) => {profileImage = e.target.files[0]}">
            <button
                class="h-10 flex justify-center items-center w-full bg-blue-400 hover:bg-blue-300 focus:bg-blue-500 disabled:bg-blue-100 cursor-pointer rounded-xl mt-6 text-white"
                @click="signUp">
              Create Account
            </button>
            <div class="text-sm text-blue-400 text-center mt-3" @click="onboarding = 0"
                 style="cursor: pointer">Have an account? log in
            </div>
          </div>
        </div>
      </template>
    </slider>
  </div>
</template>

<script setup>
import socket from "../socket"
import axios from "axios";
import Slider from "../components/Slider.vue";
import {onMounted, onUnmounted, ref} from "vue";
import router from "../router/index.js";

const showPass = ref(false)
const name = ref('')
const username = ref('')
const password = ref('')
const onboarding = ref(0)
const fileInput = ref(null)
const profileImage = ref(null)

const signIn = () => {
  axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
    username: username.value,
    password: password.value,
  }).then(response => {
    socket.auth = {token: response.data.token};
    localStorage.setItem("token", response.data.token);
    socket.connect();
    router.push('/messaging')
  })
      .catch(error => {
        alert(error)
      });
}

const signUp = () => {
  let reqForm = new FormData()
  reqForm.append("name", name.value)
  reqForm.append("username", username.value)
  reqForm.append("password", password.value)
  if (profileImage.value)
    reqForm.append("profileImage", profileImage.value, profileImage.value.name)
  axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/register`, reqForm).then(response => {
    username.value = undefined
    password.value = undefined
    name.value = undefined
    onboarding.value = 0
    alert('User Created')
  }).catch(error => {
    alert(error)
  });
}

socket.on("connect_error", (err) => {
  if (err.message === "invalid username") {
    console.log("an error occurred while connecting to socket")
  }
});

onMounted(() => {
  if(localStorage.getItem("token")){
    router.replace("/messaging")
  }
})

onUnmounted(() => {
  socket.off("connect_error");
})
</script>