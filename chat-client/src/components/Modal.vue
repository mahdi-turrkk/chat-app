<script setup>
import {nextTick, onMounted, ref, watch} from "vue";
import {displayHelper} from "../helpers/DisplayHelper.js";

let windowWidth = ref(0)

onMounted(() => {
  windowWidth.value = window.innerWidth
})
const props = defineProps(['show', 'title', 'body', 'isFit', 'showOverflow'])

const emits = defineEmits(['close'])

const showModal = ref(false)

let backdrop = ref(null)
const backdropClicked = (data) => {
  if (data.target === backdrop.value) {
    close()
  }
}

const close = () => {
  showModal.value = false
  setTimeout(() => {
    emits('close')
  }, 300)
}

watch(() => props.show, (newVal) => {
  if (document) {
    if (newVal) {
      nextTick(() => {
        showModal.value = true
      })
      document.body.style.overflow = 'hidden';
    } else {
      nextTick(() => {
        showModal.value = false
      })
      document.body.style.overflow = '';
    }
  }
}, {immediate: true})

</script>

<template>
  <div
      class="fixed min-h-full min-w-full bg-gray-900/70 top-0 left-0 flex justify-center items-center z-50"
      @click="backdropClicked" ref="backdrop" v-if="show">
    <transition :name="displayHelper(windowWidth).mdAndUp ? 'scaleFromLittle' : 'enterFromBottom'">
      <div v-if="showModal"
          class="text-black no-scrollbar bg-white px-6 w-full md:w-fit md:max-w-[500px] rounded-t md:rounded-b flex flex-col py-4 bottom-0 max-h-[65dvh] md:max-h-[80dvh] fixed md:sticky md:top-0">
        <div class="flex justify-between w-full items-center">
          <div class="text-center font-bold">{{ title }}</div>
          <div
              @click="close"
              v-if="displayHelper(windowWidth).mdAndUp"
              class="bg-white py-3 px-3 rounded-xl flex justify-center items-center hover:scale-110 transition-all duration-300 cursor-pointer">
            <i class="pi pi-times"/>
          </div>
        </div>
        <div class="lg:max-w-[600px] flex-1 overflow-y-auto thin-scrollbar pl-3 -ml-2 mt-2" :style="{'overflow-y': showOverflow ? 'visible' : 'auto'}"
             :class="isFit ? 'lg:min-w-fit' : 'lg:min-w-96'">
          <slot name="modalBody">
            <div class="text-justify">
              {{ body }}
            </div>
          </slot>
        </div>
        <div class="pt-4">
          <slot name="modalActions"></slot>
        </div>
      </div>
    </transition>
  </div>

</template>