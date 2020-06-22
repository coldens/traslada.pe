<template lang="pug">
  v-app#inspire
    v-main
      v-container.fill-height(fluid='')
        v-row(align='start' justify='center' )
          v-col(cols='12' sm='4' md='6')
            v-col(cols='12' class="pt-0")
              v-card.elevation-12
                v-toolbar(color='primary' dark='' flat='')
                  v-toolbar-title Datos de envio
                v-card-text
                  v-form
                    Address(
                      label='Dirección de recojo'
                      @changed="setInitialAddress($event)"
                      :rules="[rules.required]"
                      :google="google"
                    )
                    Address(
                      label='Dirección de entrega'
                      @changed="setEndAddress($event)"
                      :rules="[rules.required]"
                      :google="google"
                    )
                    v-text-field(
                      label='Descripción del producto a envíar' v-model='form.product' prepend-icon='mdi-account'
                      type='text' :rules="[rules.required]"
                    )
            v-col(cols='12')
              GmapMap(
                ref="mapRef"
                :center='{lat:-12.0446163, lng:-77.0557116}'
                :zoom='13'
                map-type-id='terrain'
                style='width: 100%; height: 400px'
              )

          v-col(cols='12' sm='8' md='4')
            v-col(cols='12' class="pt-0")
              v-card.elevation-12
                v-toolbar(color='primary' dark='' flat='')
                  v-toolbar-title Datos del remitente
                v-card-text
                  v-form
                    v-text-field(
                      label='Nombre' v-model='form.client.name' prepend-icon='mdi-account'
                      type='text' :rules="[rules.required]"
                    )
                    v-text-field(
                      label='Apellidos' v-model='form.client.lastname' prepend-icon='mdi-account'
                      type='text' :rules="[rules.required]"
                    )
                    v-text-field(
                      label='Correo' v-model='form.client.email' prepend-icon='mdi-at'
                      type='email' :rules="[rules.required, rules.email]"
                    )
                    v-text-field(
                      label='Telefono' v-model='form.client.phone' prepend-icon='mdi-phone'
                      type='text'
                    )


            v-col(cols='12')
              v-card.elevation-12
                v-toolbar(color='primary' dark='' flat='')
                  v-toolbar-title Datos del receptor
                v-card-text
                  v-form
                    v-text-field(
                      label='Nombre' v-model='form.receiver.name' prepend-icon='mdi-account'
                      type='text' :rules="[rules.required]"
                    )
                    v-text-field(
                      label='Apellidos' v-model='form.receiver.lastname' prepend-icon='mdi-account'
                      type='text' :rules="[rules.required]"
                    )
                    v-text-field(
                      label='Correo' v-model='form.receiver.email' prepend-icon='mdi-at'
                      type='email' :rules="[rules.required, rules.email]"
                    )
                    v-text-field(
                      label='Telefono' v-model='form.receiver.phone' prepend-icon='mdi-phone'
                      type='text'
                    )

</template>

<script>
import { gmapApi } from 'vue2-google-maps';
import Address from './components/Address.vue';

export default {
  components: { Address },
  props: {
    source: String
  },
  data() {
    return {
      form: {
        initialAddress: null,
        endAddress: null,
        product: '',
        client: {
          name: '',
          lastname: '',
          email: '',
          phone: ''
        },
        receiver: {
          name: '',
          lastname: '',
          email: '',
          phone: ''
        }
      },
      isLoading: false,
      predictions: [],
      search: null,
      markers: { a: null, b: null },
      center: '',
      rules: {
        required: value => !!value || 'Requerido.',
        counter: value => value.length <= 20 || 'Max 20 characters',
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || 'Correo Invalido.';
        }
      }
    };
  },
  computed: {
    google: gmapApi
  },
  methods: {
    setInitialAddress(address) {
      this.form.initialAddress = address;

      if (!address) {
        return this.markers.a.setMap(null);
      }

      this.geocodePlaceId(address.place_id).then(location => {
        if (this.markers.a) this.markers.a.setMap(null);

        this.$refs.mapRef.$mapPromise.then(map => {
          let marker = new this.google.maps.Marker({
            map: map,
            label: 'A',
            position: location
          });

          this.markers.a = marker;
          map.panTo(location);
        });
      });
    },
    setEndAddress(address) {
      this.form.endAddress = address;

      if (!address) {
        return this.markers.b.setMap(null);
      }

      this.geocodePlaceId(address.place_id).then(location => {
        if (this.markers.b) this.markers.b.setMap(null);

        this.$refs.mapRef.$mapPromise.then(map => {
          let marker = new this.google.maps.Marker({
            map: map,
            label: 'B',
            position: location
          });

          this.markers.b = marker;
          map.panTo(location);
        });
      });
    },
    geocodePlaceId(placeId) {
      return new Promise(resolve => {
        let geocoder = new this.google.maps.Geocoder();

        geocoder.geocode({ placeId: placeId }, function(results, status) {
          if (status === 'OK') {
            if (results[0]) {
              resolve(results[0].geometry.location);
            }
          }
        });
      });
    }
  },
  mounted() {
    // Try HTML5 geolocation.
    this.$refs.mapRef.$mapPromise.then(map => {
      map.panTo({ lat: -12.0465834, lng: -77.0481994 });
    });
  }
};
</script>
