<template lang="pug">
  v-dialog(v-model="modalTracking" persistent="" max-width="400")
    v-card
      v-card-title.headline Hemos recibido tu solicitud
      v-card-text
        p Numero de seguimiento: {{ formatTracking }}
      v-card-actions
        v-spacer
        //- v-btn(color="green darken-1" text="" @click="close()") Aceptar
</template>

<script>
export default {
  props: {
    modalTracking: Boolean,
    tracking: {
      type: [String, Number]
    },
  },
  computed: {
    formatTracking() {
      return this.pad(this.tracking, 5)
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    pad(val, max) {
      let str = `${val}`;
      return str.length < max ? this.pad('0' + str, max) : str;
    }
  }
};
</script>
