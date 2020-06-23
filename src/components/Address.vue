<template lang="pug">
  v-text-field(
    ref="address_input"
    :label="label"
    v-model="address"
    @focus="searchMapService"
    item-text="description"
    item-value="description"
    prepend-icon="mdi-crosshairs-gps"
    :rules="rules"
  )
</template>

<script>
export default {
  props: {
    google: Object,
    rules: Array,
    label: String
  },
  data() {
    return {
      search: null,
      isLoading: false,
      predictions: [],
      address: null,
      addressObject: {}
    };
  },
  computed: {
    locations() {
      return this.predictions.map(p => {
        return p;
      });
    }
  },
  methods: {
    searchMapService() {
      const elem = this.$refs.address_input.$el.querySelector('input');
      const autocomplete = new this.google.maps.places.Autocomplete(elem, {
        types: ['geocode'],
        fields: ['ALL']
      });

      autocomplete.setFields(['address_component']);

      autocomplete.addListener('place_changed', () => {
        var componentForm = {
          street_number: 'short_name',
          route: 'long_name',
          locality: 'long_name',
          administrative_area_level_1: 'short_name',
          country: 'long_name',
          postal_code: 'short_name'
        };

        const place = autocomplete.getPlace();
        this.addressObject.place_id = place.place_id;
  
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];

          if (componentForm[addressType]) {
            this.addressObject[addressType] =
              place.address_components[i][componentForm[addressType]];
          }
        }

        this.address = place.formatted_address;

        this.changed();
      });
    },
    changed() {
      this.$emit('changed', {
        text: this.address,
        object: this.addressObject,
      });
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
};
</script>
