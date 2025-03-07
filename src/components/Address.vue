<template lang="pug">
  v-text-field(
    ref="address_input"
    :label="label"
    v-model="address"
    @focus="searchMapService"
    prepend-icon="mdi-crosshairs-gps"
    :rules="rules"
    :error="!location"
    :error-messages="!location ? 'Debe seleccionar una ubicación valida.' : ''"
  )
</template>

<script>
export default {
  props: {
    location: {
      type: Object,
      required: false
    },
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
      addressObject: {},
      validDistricts: [
        'ancón',
        'ate',
        'barranco',
        'bellavista',
        'breña',
        'callao',
        'carabayllo',
        'carmen de la legua',
        'chaclacayo',
        'chorrillos',
        'cercado de lima',
        'cieneguilla',
        'comas',
        'el agustino',
        'independencia',
        'jesús maría',
        'la molina',
        'la perla',
        'la punta',
        'la victoria',
        'lima',
        'lince',
        'los olivos',
        'lurigancho',
        'lurín',
        'magdalena del mar',
        'mi perú',
        'miraflores',
        'pachacámac',
        'pucusana',
        'pueblo libre',
        'puente piedra',
        'punta hermosa',
        'punta negra',
        'rímac',
        'san bartolo',
        'san borja',
        'san isidro',
        'san juan de lurigancho',
        'san juan de miraflores',
        'san luis',
        'san martín de porres',
        'san miguel',
        'santa anita',
        'santa maría del mar',
        'santa rosa',
        'santiago de surco',
        'surquillo',
        'ventanilla',
        'villa el salvador',
        'villa maría del triunfo',
      ]
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
        const addressObject = {};
        addressObject.place_id = place.place_id;

        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];

          if (componentForm[addressType]) {
            addressObject[addressType] =
              place.address_components[i][componentForm[addressType]];
          }
        }

        const district = addressObject.locality.toLowerCase();

        if (!this.validDistricts.includes(district)) {
          this.address = '';
          return alert(
            'Error: la dirección no pertenece a un distrito valido.'
          );
        }

        this.addressObject = addressObject;
        this.address = place.formatted_address;

        this.changed();
      });
    },
    changed() {
      this.$emit('changed', {
        text: this.address,
        object: this.addressObject
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
