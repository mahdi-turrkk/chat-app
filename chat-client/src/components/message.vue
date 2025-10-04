<template>
  <div class="w-[80%] px-5 py-4 mx-3 rounded-2xl shadow" :class="isMe ? 'bg-blue-400 text-white' : 'bg-white text-gray-800'">
    {{message}}
    <div class="flex gap-2 text-xs justify-end" :class="isMe ? 'text-gray-200' :'text-gray-600'">
      <span>{{messageTime}}</span>
      <i class="pi pi-check" v-if="isSent"/>
      <i class="pi pi-check-circle" v-if="isSeen"/>
    </div>
  </div>
</template>

<script>
export default {
  props: ['message', 'isMe', "messageTime", 'isSent', 'isSeen']
}
</script>