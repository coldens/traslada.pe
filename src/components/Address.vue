<template lang="pug">
  v-autocomplete(
    ref="address_a"
    :label="label"
    v-model="address"
    @change="changed"
    :items="locations"
    :loading="isLoading"
    :search-input.sync="search"
    item-text="description"
    item-value="description"
    prepend-icon="mdi-crosshairs-gps"
    :rules="rules"
    :return-object="true"
  )
</template>

<script>
export default {
  props: {
    google: Object,
    rules: Array,
    label: String,
  },
  data() {
    return {
      search: null,
      isLoading: false,
      predictions: [],
      address: null,
    }
  },
  computed: {
    locations() {
      return this.predictions.map(p => {
        return p;
      });
    }
  },
  methods: {
    searchMapService(input, callback) {
      let service = new this.google.maps.places.AutocompleteService();
      service.getQueryPredictions({ input }, callback);
    },
    changed() {
      this.$emit('changed', this.address);
    }
  },
  watch: {
    search(val) {
      // Items have already been requested
      if (this.isLoading) return;

      if (val == '') return;

      this.isLoading = true;

      let displaySuggestions = (predictions, status) => {
        if (status != this.google.maps.places.PlacesServiceStatus.OK) {
          return;
        }

        this.predictions = predictions;
        this.isLoading = false;
      };

      this.searchMapService(val, displaySuggestions);
    }
  }
}
</script>