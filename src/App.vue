<template lang="pug">
  v-app#inspire
    terms(:terms="terms" @agree="agree")
    tracking(:modal-tracking="modalTracking" :tracking="tracking")

    v-main
      v-container.fill-height(fluid='')
        v-row(align='start' justify='center' )
          v-dialog(v-model='loading' hide-overlay='' persistent='' width='300')
            v-card(color='primary' dark='')
              v-card-text
                | Procesando por favor espere...
                v-progress-linear.mb-0(indeterminate='' color='white')

          v-col(cols='12' sm='4' md='6')
            v-col(cols='12' class="pt-0")
              v-card.elevation-12
                v-toolbar(color='primary' dark='' flat='')
                  v-toolbar-title Datos de envío
                v-card-text
                  v-form(autocomplete="chrome-off" @submit.prevent="" v-model="valid_address")
                    Address(
                      ref="location_a"
                      v-if="google"
                      label='Dirección de recojo'
                      @changed="setInitialAddress($event)"
                      :rules="[rules.required]"
                      :google="google"
                      :location="location_a"
                    )
                    v-text-field(
                      label='Piso/Departamento/Oficina'
                      v-model='form.client.house'
                      prepend-icon='mdi-home'
                      type='text'
                    )
                    Address(
                      ref="location_b"
                      label='Dirección de entrega'
                      @changed="setEndAddress($event)"
                      :rules="[rules.required]"
                      :google="google"
                      :location="location_b"
                    )
                    v-text-field(
                      label='Piso/Departamento/Oficina'
                      v-model='form.receiver.house'
                      prepend-icon='mdi-home'
                      type='text'
                    )
                    v-textarea(
                      label='Descripción del producto a envíar'
                      v-model.trim='form.product'
                      prepend-icon='mdi-bag-carry-on'
                      type='text'
                      :rules="[rules.required]"
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
                  v-form(autocomplete="chrome-off" @submit.prevent="" v-model="valid_client")
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
                      label='Telefono' v-model='form.client.phone'
                      prepend-icon='mdi-phone'
                      type='text'
                      :rules="[rules.required]"
                    )


            v-col(cols='12')
              v-card.elevation-12
                v-toolbar(color='primary' dark='' flat='')
                  v-toolbar-title Datos del receptor
                v-card-text
                  v-form(autocomplete="chrome-off" @submit.prevent="" v-model="valid_receiver")
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
                      label='Telefono' v-model='form.receiver.phone'
                      prepend-icon='mdi-phone'
                      type='text'
                      :rules="[rules.required]"
                    )

            v-col(cols='12')
              v-card.elevation-12
                v-toolbar(color='primary' dark='' flat='')
                  v-toolbar-title Haz tu envío
                v-card-text
                  v-text-field(
                    label='Distancia'
                    v-model="distanceKm"
                    prepend-icon='mdi-earth'
                    type='text'
                    :disabled="true"
                  )
                  v-text-field(
                    label='Total'
                    v-model="totalSoles"
                    prepend-icon='mdi-earth'
                    type='text'
                    :disabled="true"
                  )
                  v-btn(block color="primary" dark :disabled="loading" @click="showTerms") Envíar

</template>

<script>
import { gmapApi } from 'vue2-google-maps';
import Terms from './components/Terms.vue';
import Tracking from './components/Tracking.vue';
import Address from './components/Address.vue';
import axios from 'axios';
import qs from 'qs';

export default {
  components: { Address, Terms, Tracking },
  props: {
    source: String
  },
  data() {
    return {
      terms: false,
      modalTracking: false,
      tracking: '',
      loading: false,
      valid_address: false,
      valid_client: false,
      valid_receiver: false,
      location_a: null,
      location_b: null,
      distance: 0,
      duration: 0,
      form: {
        product: '',
        client: {
          name: '',
          lastname: '',
          email: '',
          phone: '',
          address: '',
          house: ''
        },
        receiver: {
          name: '',
          lastname: '',
          email: '',
          phone: '',
          address: '',
          house: ''
        }
      },
      isLoading: false,
      predictions: [],
      search: null,
      markers: { a: null, b: null },
      center: '',
      rules: {
        required: value => !!value || 'Requerido.',
        counter: value => value.length <= 20 || 'Máximo 20 caracteres',
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || 'Correo Invalido.';
        },
        initialMap: () => {
          return this.location_a
            ? true
            : 'Debe seleccionar una ubicación valida.';
        },
        endMap: () => {
          return this.location_b
            ? true
            : 'Debe seleccionar una ubicación valida.';
        }
      }
    };
  },
  computed: {
    google: gmapApi,
    distanceKm() {
      return this.distance.toFixed(2) + ' km';
    },
    total() {
      const distance = parseFloat(this.distance.toFixed(2));
      let total = 10;

      if (distance >= 7 && distance <= 25) {
        total = distance * 1.5;
      }
      if (distance > 25) {
        total = distance * 1.3;
      }

      return total;
    },
    totalSoles() {
      return 'S/ ' + this.total.toFixed(2);
    }
  },
  methods: {
    flight() {
      if (!this.location_a || !this.location_b) return null;

      const distanceMatrixService = new this.google.maps.DistanceMatrixService();
      let distance = 0,
        duration = 0;

      distanceMatrixService.getDistanceMatrix(
        {
          origins: [this.location_a],
          destinations: [this.location_b],
          travelMode: 'DRIVING',
          unitSystem: this.google.maps.UnitSystem.METRIC,
          avoidHighways: true,
          avoidTolls: true
        },
        (response, status) => {
          if (status == 'OK') {
            response.rows.forEach(row => {
              row.elements.forEach(elem => {
                distance += elem.distance.value;
                duration += elem.duration.value;
              });
            });
          }

          this.distance = distance > 0 ? distance / 1000 : 0;
          this.duration = duration;
        }
      );

      return null;
    },
    setInitialAddress(address) {
      this.form.client.address = address.text;

      if (!address) {
        return this.markers.a.setMap(null);
      }

      this.geocodePlaceId(address.object.place_id).then(location => {
        if (this.markers.a) this.markers.a.setMap(null);

        this.location_a = location;

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
      this.form.receiver.address = address;

      if (!address) {
        return this.markers.b.setMap(null);
      }

      this.geocodePlaceId(address.object.place_id).then(location => {
        if (this.markers.b) this.markers.b.setMap(null);

        this.location_b = location;

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
    },
    showTerms() {
      this.terms = true;
    },
    agree(bool) {
      if (bool) {
        this.goToSafe();
      }

      this.terms = false;
    },
    goToSafe() {
      if (this.loading) {
        return;
      }

      if (!this.valid_address) {
        return alert('Por favor, completa los Datos de envío');
      }
      if (!this.valid_client) {
        return alert('Por favor, completa los Datos del remitente');
      }
      if (!this.valid_receiver) {
        return alert('Por favor, completa los Datos del receptor');
      }

      // if (!confirm('Confirma si estas seguro de hacer este envío')) {
      //   return;
      // }

      this.loading = true;
      const data = {
        client_name: this.form.client.name,
        client_lastname: this.form.client.lastname,
        client_email: this.form.client.email,
        client_phone: this.form.client.phone,
        client_address: this.$refs.location_a.address,
        client_house: this.form.client.house,
        client_coords: `${this.location_a.lat()},${this.location_a.lng()}`,
        receiver_name: this.form.receiver.name,
        receiver_lastname: this.form.receiver.lastname,
        receiver_email: this.form.receiver.email,
        receiver_phone: this.form.receiver.phone,
        receiver_address: this.$refs.location_b.address,
        receiver_house: this.form.receiver.house,
        receiver_coords: `${this.location_b.lat()},${this.location_b.lng()}`,
        product: this.form.product,
        distance: this.distance
      };

      axios
        .post(
          'https://script.google.com/macros/s/AKfycbwHbVXPhbzI_xoW15_-6QWuYWeb0dWg5SNkOA4clv0nHY4ACjs/exec',
          qs.stringify(data),
          {
            headers: {
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
          }
        )
        .then((response) => {
          this.loading = false;
          this.tracking = response.data.data.tracking;
          this.modalTracking = true;
        })
        .catch(() => {
          alert('Oh no, hubo un error, intenta nuevamente.');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
  mounted() {
    // Try HTML5 geolocation.
    this.$refs.mapRef.$mapPromise.then(map => {
      map.panTo({ lat: -12.0465834, lng: -77.0481994 });
    });
  },
  watch: {
    location_a() {
      this.flight();
    },
    location_b() {
      this.flight();
    }
  }
};
</script>
