import { PolymerElement } from '../@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from '../@polymer/polymer/lib/utils/html-tag.js';
/**
 * `pb-select-odd`: Switch between available ODDs.
 * It loads the list of ODDs from `components-odd.xql`.
 * Emits a `pb-refresh` event to subscribed views.
 *
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-select-odd.html
 */
class PbSelectOdd extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            paper-dropdown-menu {
                --paper-listbox-background-color: white;
                width: 100%;
            }
        </style>

        <paper-dropdown-menu id="menu" label="[[label]]" name="[[name]]">
            <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{odd}}" attr-for-selected="value">
                <template is="dom-repeat" items="{{odds}}">
                    <paper-item value\$="[[item.name]]">[[item.label]]</paper-item>
                </template>
            </paper-listbox>
        </paper-dropdown-menu>

        <iron-ajax id="load" url="modules/lib/components-list-odds.xql" verbose="" handle-as="json" method="get" on-response="_update"></iron-ajax>
`;
  }

  static get is() {
      return 'pb-select-odd';
  }

  static get properties() {
      return {
          /** Id of the document component on which the ODD should be changed */
          src: {
              type: String
          },
          /** The label to show on top of the dropdown menu */
          label: {
              type: String,
              value: 'Use ODD'
          },
          /** The ODDs to show. */
          odds: {
              type: Array
          },
          name: {
              type: String
          },
          /** Currently selected ODD. If this property is set, the component
           * will immediately load the list of ODDs from the server and select
           * the given ODD.
           */
          odd: {
              type: String,
              notify: true,
              observer: '_selected'
          }
      };
  }

  connectedCallback() {
      super.connectedCallback() ;
  }

  ready() {
      super.ready();
      this.subscribeTo('pb-update', this._onTargetUpdate.bind(this));

      if (this.odd) {
          this._refresh();
      }
  }

  _selected(newOdd, oldOdd) {
      if (typeof oldOdd !== 'undefined' && newOdd !== oldOdd) {
          console.log('<pb-select-odd> Switching to ODD %s from %s', this.odd, oldOdd);
          const doc = this.getDocument();
          if (doc) {
              doc.odd = this.odd;
          }
          this.setParameter('odd', this.odd + '.odd');
          this.pushHistory('changed odd', {odd: this.odd});
          this.emitTo('pb-refresh', {
              odd: this.odd
          });
      }
  }

  _refresh() {
      this.$.load.params = { odd: this.odd };
      this.$.load.generateRequest();
  }

  _update() {
      this.set('odds', this.$.load.lastResponse);
  }

  _onTargetUpdate(ev) {
      let newOdd = ev.detail.data.odd;
      if (newOdd) {
          newOdd = newOdd.replace(/^(.*?)\.[^\.]+$/, '$1');
          console.log('<pb-select-odd> Set current ODD from %s to %s', this.odd, newOdd);
      }
      if (newOdd !== this.odd) {
          this._refresh();
      }
      this.odd = newOdd;
  }
}

window.customElements.define(PbSelectOdd.is, PbSelectOdd);
