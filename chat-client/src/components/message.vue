<template>
  <v-card width="80%" :color="color" class="px-5 py-4 mx-3" style="border-radius: 15px">
    {{ message }}
    <div class="text-end text-caption">{{ messageTime }}
      <v-icon color="background" size="20" class="mt-n1 ml-2" v-if="isSent">mdi-check</v-icon>
      <v-icon color="background" size="20" class="mt-n1 ml-2" v-if="isSeen">mdi-check-all</v-icon>
    </div>
  </v-card>
</template>

<script>
export default {
  props: ['message', 'color', "messageTime", 'isSent', 'isSeen']
}
</script>