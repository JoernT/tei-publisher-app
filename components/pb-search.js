import { PolymerElement } from '../@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from '../@polymer/polymer/lib/utils/html-tag.js';
import { afterNextRender } from '../@polymer/polymer/lib/utils/render-status.js';
/**
 * Search field e.g. used in app header
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-search.html
 */
class PbSearch extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host{
            }

            paper-input {
                --paper-input-container-input:{
                    color: var(--pb-search-input, --paper-black);
                    border: white;
                };
                --paper-input-container-label: {
                    color:var(--pb-search-label, --paper-grey-500);
                };
            }
            paper-autocomplete-suggestions {
                --suggestions-item: {
                    color: var(--pb-search-label, --paper-grey-500)
                };
            }

        </style>
        <iron-form id="ironform" allow-redirect="[[redirect]]">
            <form id="searchPageForm" method="get" action="{{action}}" accept="text/html">
                <paper-input id="search" type="search" name="query" on-keyup="_handleEnter" label="[[placeHolder]]" no-label-float="" value="[[value]]">
                    <iron-icon icon="search" on-click="_doSearch" slot="prefix"></iron-icon>
                </paper-input>
                <paper-autocomplete-suggestions id="autocomplete" for="search" source="[[_suggestions]]" remote-source=""></paper-autocomplete-suggestions>
                <slot></slot>
                <input type="hidden" name="doc">
            </form>
        </iron-form>
        <iron-ajax id="autocompleteLoader" url="modules/autocomplete.xql" verbose="" handle-as="json" method="get" on-response="_updateSuggestions"></iron-ajax>
`;
  }

  static get is() {
      return 'pb-search';
  }

  static get properties() {
      return {
          action:{
              type: String,
              reflectToAttribute:true
          },
          value:{
              type:String,
              reflectToAttribute:true
          },
          placeHolder: {
              type: String,
              reflectToAttribute:true
          },
          redirect: {
              type: Boolean,
              value: false
          },
          currentDoc: {
              type: String
          },
          submitOnLoad: {
              type: Boolean,
              value: false
          }
      }
  }

  connectedCallback() {
      super.connectedCallback();
      this.$.autocomplete.addEventListener('autocomplete-change', this._autocomplete.bind(this));
      this.$.ironform.addEventListener('iron-form-response', (event) =>
          event.detail.completes.then((r) => this.emitTo('pb-search', r.parseResponse()))
      );
  }

  ready() {
      super.ready();

      if (this.submitOnLoad) {
          afterNextRender(this, () => this._doSearch());
      }
  }

  _doSearch(e){
      const json = this.$.ironform.serializeForm();
      // always start on first result after submitting new search
      json.start = 1;
      if (this.redirect) {
          this._doSubmit();
      } else {
          this.emitTo('pb-load', {
              "url": this.action,
              "params": json
          });
      }
  }

  _handleEnter(e){
      if(this.$.search.value.length != 0 && e.keyCode == 13){
          this._doSearch();
      }
  }

  _doSubmit(){
      this.$.ironform.submit();
  }

  _autocomplete(ev) {
      const params = this.$.ironform.serializeForm();
      this.$.autocompleteLoader.params = params;
      this.$.autocompleteLoader.generateRequest();
  }

  _updateSuggestions() {
      this.$.autocomplete.suggestions(this.$.autocompleteLoader.lastResponse);
  }

  /**
   * Fired to perform the actual search
   *
   * @event pb-load
   * @param {object} Parameters to be passed to the request
   */
}

window.customElements.define(PbSearch.is, PbSearch);
