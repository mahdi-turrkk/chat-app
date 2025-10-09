<template>
  <div class="max-w-[80%] w-fit px-5 py-4 mx-3 rounded-2xl shadow"
       :class="isMe ? 'bg-blue-400 text-white' : 'bg-white text-gray-800'">
    <div class="mb-2">
      <div class="flex gap-3 justify-around mb-2 flex-wrap">
        <img v-for="file in message.files.filter(item => item.fileType === 'image')"
             :src="`${backendUrl}/api/files/${file.fileName}`"
             class="w-44 h-44 object-cover rounded-lg"
             @click="selectedImage = `${backendUrl}/api/files/${file.fileName}`;showImageModal = true">
      </div>
      <div class="w-full flex flex-col gap-2" v-for="file in message.files.filter(item => item.fileType === 'video')">
        <video :src="`${backendUrl}/api/files/${file.fileName}`" controls
               preload="metadata" class="rounded-lg h-60"/>
      </div>
      <div class="flex flex-col gap-2 mt-2">
        <a v-for="file in message.files.filter(item => item.fileType !== 'video' && item.fileType !== 'image')" download
           target="_blank"
           :href="`${backendUrl}/api/files/${file.fileName}`">
          <div class="w-full flex items-center gap-2 p-2 rounded-lg cursor-pointer min-w-80"
               :class="isMe ? 'bg-white/30 text-white' : 'bg-blue-400/30 text-blue-400'">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
                 :class="isMe ? 'bg-white/70 text-blue-400' : 'bg-blue-400/70 text-white'">
              <i class="pi pi-file"/>
            </div>
            {{ file.fileName }}
          </div>
        </a>
      </div>
    </div>
    <div>
      {{ message.messageText }}
    </div>
    <div class="flex gap-2 text-xs justify-end" :class="isMe ? 'text-gray-200' :'text-gray-600'">
      <span>{{ messageTime }}</span>
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