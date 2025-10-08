<template>
  <modal :show="showEditProfile" @close="() => {selectedProfileImage = null;selectedProfileImageUrl = null;emit('close')}" title="Edit Profile">
    <template v-slot:modalBody>
      <div class="py-6 px-4">
        <div class="flex justify-center">
          <div class="rounded-full relative w-32 h-32 text-white flex justify-center items-center font-bold text-sm"
               :class="`bg-${colors[(name.charCodeAt(0) + name.charCodeAt(1)) % 7]}`">
            <div class="rounded-full relative w-32 h-32 text-white flex justify-center items-center font-bold text-lg overflow-hidden">
              <img :src="selectedProfileImageUrl" v-if="selectedProfileImageUrl" :alt="name"/>
              <img :src="`${backendUrl}/api/files/${profileImage}?fileType=profile`" v-else-if="profileImage" :alt="name"/>
            </div>
            {{profileImage ? '' : name.slice(0, 2) }}
          </div>
        </div>
        <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
               v-model="editedName" placeholder="Name">
        <div class="relative cursor-pointer">
          <input class="rounded-xl h-10 px-4 shadow-inner bg-gray-100 w-full mt-6 focus:outline-blue-400"
                 :value="selectedProfileImage?.name" placeholder="Profile Image" disabled>
          <div class="absolute top-0 right-0 left-0 bottom-0" @click="fileInput.click()"></div>
        </div>
        <input class="hidden" type="file" accept="image/png , image/jpeg, image'jpg" ref="fileInput" @change="imageChanged">
      </div>
    </template>
    <template v-slot:modalActions>
      <div class="flex justify-end">
        <button
            class="h-9 px-4 flex justify-center items-center bg-blue-400 hover:bg-blue-300 focus:bg-blue-500 disabled:bg-blue-100 cursor-pointer rounded-xl text-white"
            @click="handleEditUser"
        >
          Save changes
        </button>
      </div>
    </template>
  </modal>
</template>
<script setup lang="ts">
import Modal from "../components/Modal.vue";
import {ref, watch} from "vue";
import colors from "../helpers/staticData.js";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL
const props = defineProps(['showEditProfile' , 'profileImage', 'name'])
const emit  = defineEmits(["close", "userEdited"])

const fileInput = ref(null)
const selectedProfileImage = ref(null)
const selectedProfileImageUrl = ref(null)
const editedName = ref('')

watch(() => props.name , () => {
  editedName.value = props.name
}, {immediate: true})

const imageChanged = (e) => {
  selectedProfileImage.value = e.target.files[0]
  selectedProfileImageUrl.value = URL.createObjectURL(selectedProfileImage.value)
}

const handleEditUser = () => {
  let reqBody = new FormData()
  reqBody.append('name', editedName.value)
  if(selectedProfileImage.value)
    reqBody.append('profileImage', selectedProfileImage.value, selectedProfileImage.value.name)
  axios.put(`${backendUrl}/api/users/editProfile`, reqBody, {
    headers: {
      Authorization: localStorage.getItem('token')
    }
  }).then(res => {
    localStorage.setItem('token', res.data.token)
    emit("userEdited" , res.data.name , res.data.profileImage)
  })
}
</script>