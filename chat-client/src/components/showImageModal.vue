<template>
  <modal :show="showImage" @close="() => emit('close')" title="Image">
    <template v-slot:modalBody>
      <div class="py-6 px-4">
        <div class="flex justify-center">
          <img :src="imagePath"/>
        </div>
      </div>
    </template>
  </modal>
</template>
<script setup lang="ts">
import Modal from "../components/Modal.vue";

defineProps(['showImage' , 'imagePath'])
const emit  = defineEmits(["close", "userEdited"])

</script>