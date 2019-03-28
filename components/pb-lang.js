import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import './assets/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import './assets/@polymer/paper-listbox/paper-listbox.js';
import './assets/@polymer/paper-item/paper-item.js';

/**
 * `pb-lang`
 * A language selector displayed as a dropdown list. Will reload the page when user selects an entry from
 * the list that is different than the current one.
 *
 * The list items (paper-item elements) must be passed in as lightDOM (e.g. generated with server-side templating
 * or by hardcoding them). They are not loaded by this component.
 *
 * Limitations: labels are just the ISO 639-1 codes. There's no distinction between label and values
 *
 * @customElement
 * @polymer
 */
class PbLang extends PolymerElement {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            paper-dropdown-menu{
                --paper-dropdown-menu: {
                    color: var(--pb-lang-item-color);
                };

                --paper-input-container-input:{
                    color: var(--pb-lang-input-color, white);
                };
                --paper-input-container-label:{
                    color:var(--pb-lang-label-color, --paper-grey-100);
                }
            }

        </style>

        <paper-dropdown-menu id="menu" label="[[label]]">
            <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{selected}}">
                <slot></slot>
<!--
                <template id="repeat" is="dom-repeat" items="[[languages]]">
                    <paper-item>[[item]]</paper-item>
                </template>
-->
            </paper-listbox>
        </paper-dropdown-menu>
`;
  }

  static get is() {
      return 'pb-lang';
  }

  static get properties() {
      return {
          /**
           * The label for a language in the dropdown
           */
          label: {
              type: String,
              value: 'Language'
          },
          /**
           * the currently selected language. When changed the observer will trigger a reload of the page.
           */
          selected: {
              type: String,
              observer: '_changed'
          },
/*
          languages:{
              type: Array
          }
*/
      };
  }

  connectedCallback() {
      super.connectedCallback();
//                console.log("langs ", this.languages);
  }

  ready(){
      super.ready();
  }

  _changed(newVal, oldVal) {
      if (typeof oldVal !== 'undefined' && newVal !== oldVal) {
          const loc = window.location;
          const lang = this.$.menu.selectedItemLabel;
          let search;
          if (loc.search) {
              search = loc.search.replace(/\&?lang=[\w]+/, '');
              if (search == '?') {
                  search = search + 'lang=' + lang;
              } else {
                  search = search + '&lang=' + lang;
              }
          } else {
              search = '?lang=' + lang;
          }
          loc.replace(loc.protocol + '//' + loc.hostname + ':' + loc.port + loc.pathname + search + loc.hash);
      }
  }
}

window.customElements.define(PbLang.is, PbLang);
