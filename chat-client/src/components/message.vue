<template>
  <div class="max-w-[80%] w-fit px-5 py-4 mx-3 rounded-2xl shadow" :class="isMe ? 'bg-blue-400 text-white' : 'bg-white text-gray-800'">
    <div class="flex gap-3 justify-around mb-2 flex-wrap">
      <img v-for="file in message.files" :src="`${backendUrl}/api/files/${file}`" class="w-44 h-44 object-cover rounded-lg"
           @click="selectedImage = `${backendUrl}/api/files/${file}`;showImageModal = true"
      >
    </div>
    <div>
      {{message.messageText}}
    </div>
    <div class="flex gap-2 text-xs justify-end" :class="isMe ? 'text-gray-200' :'text-gray-600'">
      <span>{{messageTime}}</span>
      <i class="pi pi-check" v-if="isSent"/>
      <i class="pi pi-check-circle" v-if="isSeen"/>
    </div>
    <show-image-modal :show-image="showImageModal" :image-path="selectedImage" @close="showImageModal = false"/>
  </div>
</template>

<script setup>
import ShowImageModal from "../components/showImageModal.vue";
import {ref} from "vue";

defineProps(['message', 'isMe', "messageTime", 'isSent', 'isSeen'])
const backendUrl = import.meta.env.VITE_BACKEND_URL
const showImageModal = ref(false)
const selectedImage = ref("")
</script>