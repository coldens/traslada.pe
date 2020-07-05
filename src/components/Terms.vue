<template lang="pug">
  v-dialog(v-model="terms" persistent="" max-width="400")
    v-card
      v-card-title.headline Términos y condiciones
      v-card-text
        ul
          li Se brinda tolerancia de 10 minutos.
          li Si realiza la cancelación del servicio al llegar al punto, se cobrará el 50% de la tarifa. 
          li Si se realiza una demora, por cada 20 minutos, se realizará un cobro de S/. 12 adicional.
          li Los pagos sólo se realizan vía transferencia. 
          li El conductor podría no tomar el servicio, cuando al momento de recoger el paquete no coincida visiblemente con lo que indicó se trasladaría. De ocurrir esto se cobrará el 50% del servicio solicitado.
          li Tener en consideración que debemos cumplir con otros servicios. 👍🏼
      v-card-actions
        v-spacer
        v-btn(color="green darken-1" text="" @click="agree(false)") Cancelar
        v-btn(color="green darken-1" text="" @click="agree(true)") Hacer Envío
</template>

<script>
export default {
  props: {
    terms: Boolean
  },
  methods: {
    agree(bool) {
      this.$emit('agree', bool);
    }
  }
};
</script>
