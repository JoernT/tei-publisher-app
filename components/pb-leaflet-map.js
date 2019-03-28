import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import { afterNextRender } from './assets/@polymer/polymer/lib/utils/render-status.js';
import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
/**
 * `pb-leaflet-map`
 *
 * A wrapper component for [leaflet](https://leafletjs.com/) displaying a map.
 *
 * @customElement
 * @polymer
 * @demo demo/pb-leaflet-map.html
 */
class PbLeafletMap extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.4/dist/leaflet.css">

        <style>
            :host {
                display: block;
            }

            #map {
                width: 100%;
                height: 100%;
            }
        </style>

        <div id="map"></div>
`;
  }

  static get is() {
      return 'pb-leaflet-map';
  }

  static get properties() {
      return {
          latitude: {
              type: Number,
              value: 51.505
          },
          longitude: {
              type: Number,
              value: -0.09
          },
          zoom: {
              type: Number,
              value: 15
          },
          crs: {
              type: String,
              value: 'EPSG3857'
          },
          accessToken: {
              type: String,
              value: ''
          },
          _map: {
              type: Object
          },
          _markers: {
              type: Array,
              value: []
          }
      };
  }

  static get observers() {
      return [
          // Observer method name, followed by a list of dependencies, in parenthesis
          '_locationChanged(latitude, longitude, zoom)'
      ]
  }

  connectedCallback() {
      super.connectedCallback();

      this.subscribeTo('pb-update-map', (ev) => {
          const markers = [];
          const bounds = L.latLngBounds();
          ev.detail.forEach((loc) => {
              const marker = L.marker([loc.latitude, loc.longitude]);
              marker.addEventListener('click', () => {
                  this.emitTo('pb-leaflet-marker-click', loc);
              });
              marker.bindTooltip(loc.label);
              markers.push(marker);
              marker.addTo(this._map);
              bounds.extend([loc.latitude, loc.longitude]);
          });
          this._markers = markers;
          if (markers.length > 1) {
              this._map.fitBounds(bounds);
          }
      });

      this.subscribeTo('pb-update', function(ev) {
          this._markers.forEach(function(marker) {
              marker.remove();
          });

          const markers = [];
          const bounds = L.latLngBounds();
          ev.detail.root.querySelectorAll('pb-geolocation').forEach(function(loc) {
              const marker = L.marker([loc.latitude, loc.longitude]).addTo(this._map);
              markers.push(marker);
              bounds.extend([loc.latitude, loc.longitude]);
          }.bind(this));
          this._markers = markers;
          if (markers.length > 0) {
              this._map.fitBounds(bounds);
          } else {
              this._map.setZoom(this.zoom);
          }
      }.bind(this));

      this.subscribeTo('pb-geolocation', function(ev) {
          if (ev.detail.coordinates) {
              this.setProperties({
                  latitude: ev.detail.coordinates.latitude,
                  longitude: ev.detail.coordinates.longitude
              });
          }
      }.bind(this));
  }

  ready() {
      super.ready();

      afterNextRender(this, this._initMap);
  }

  _initMap() {
      if (this._map) {
          return;
      }

      L.Icon.Default.imagePath = 'resources/images/';

      let crs;
      switch (this.crs) {
          case 'EPSG4326':
              crs = L.CRS.EPSG4326;
              break;
          default:
              crs = L.CRS.EPSG3857;
              break;
      }
      this._map = L.map(this.$.map, {
          zoom: this.zoom,
          center: L.latLng([this.latitude, this.longitude]),
          crs: crs
      });
      // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // 	maxZoom: 18,
      // 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      // }).addTo(this._map);
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox.streets',
          accessToken: this.accessToken
      }).addTo(this._map);
      // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      // 	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      // }).addTo(this._map);

      L.control.scale().addTo(this._map);
  }

  _locationChanged(latitude, longitude, zoom) {
      if (this._map) {
          const coords = L.latLng([latitude, longitude]);
          this._markers.forEach(marker => {
              if (marker.getLatLng().equals(coords)) {
                  marker.openTooltip();
              } else {
                  marker.closeTooltip();
              }
          })
          this._map.setView(coords, zoom);
      }
  }
}

window.customElements.define(PbLeafletMap.is, PbLeafletMap);
