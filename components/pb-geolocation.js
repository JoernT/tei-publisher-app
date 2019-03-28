import './assets/@polymer/polymer/polymer-element.js';
import './pb-highlight.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="pb-geolocation">
    <template strip-whitespace="">
        <style>
            :host {
                display: inline;
            }

            @keyframes keyFrameBackgroundColorIn {
                0% {
                    background-color: inherit;
                }
                100% {
                    background-color: var(--pb-highlight-color, #F9E976);
                }
            }

            #content {
                display: inline;

                @apply --pb-highlight;
            }

            .highlight-on {
                background-color: var(--pb-highlight-color, #F9E976);
                animation-name: keyFrameBackgroundColorIn;
                animation-duration: 500ms;
                animation-iteration-count: 1;
                animation-timing-function: ease-in;

            }

            .highlight-off {
                background-color: inherit;
            }
        </style>

        <span id="content"><slot></slot></span>
    </template>

    
</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * Represents a geo location. Extends `pb-highlight`, but sends an additional `pb-geolocation` event
 * on mouseover.
 *
 *
 * @customElement
 * @polymer
 * @demo demo/pb-leaflet-map.html
 */
class PbGeolocation extends PbHighlight {
    static get is() {
        return 'pb-geolocation';
    }

    static get properties() {
        return {
            longitude: {
                type: Number
            },
            latitude: {
                type: Number
            },
            /**
             * Optional label for the place, e.g. to display a marker
             */
            label: {
                type: String
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();

        this.addEventListener('mouseover', function() {
            this.emitTo('pb-geolocation', {
                coordinates: {
                    latitude: this.latitude,
                    longitude: this.longitude
                },
                label: this.label
            });
        }.bind(this));
    }

    ready(){
        super.ready();
    }

    /**
     * Fired on mouseover
     *
     * @event pb-geolocation
     * @param {Object} coordinates an object with two properties: latitude and longitude
     * @param {String} label an optional label for the place
     */
}

window.customElements.define(PbGeolocation.is, PbGeolocation);
