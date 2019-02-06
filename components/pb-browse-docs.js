import './assets/@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import { afterNextRender } from './assets/@polymer/polymer/lib/utils/render-status.js';
import './assets/@polymer/paper-dropdown-menu/paper-dropdown-menu';
import './assets/@polymer/paper-listbox/paper-listbox';
import './assets/@polymer/paper-item/paper-item';
import './assets/@polymer/paper-input/paper-input';
import './assets/@polymer/iron-icons/iron-icons';
import './assets/@polymer/iron-icon/iron-icon';
import './assets/@cwmr/paper-autocomplete/paper-autocomplete-suggestions';
import './assets/@polymer/iron-ajax/iron-ajax';
import './assets/@polymer/paper-dialog/paper-dialog';
import './assets/@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import './assets/@polymer/paper-button/paper-button';

/**
 * `pb-browse-docs`
 *
 * loads a list of documents for browsing. Also allows to delete or download a given document.
 *
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 */
class PbBrowseDocs extends PbMixin(PbLoad) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            .toolbar {
                display: flex;
                justify-content: space-between;
            }

            [name="toolbar"] {
                flex: 1 0;
            }

            #sort {
                display: block;
            }

            #filterString {
                position: relative;
                display: inline-block;
                vertical-align: bottom;
            }

            .hidden {
                display: none;
            }
        </style>

        <div class="toolbar">
            <paper-dropdown-menu id="sort" label="[[sortLabel]]">
                <paper-listbox selected="{{sortBy}}" slot="dropdown-content" class="dropdown-content" attr-for-selected="value">
                    <template id="repeat" is="dom-repeat" items="[[sortOptions]]">
                        <paper-item value="[[item.value]]">[[item.label]]</paper-item>
                    </template>
                </paper-listbox>
            </paper-dropdown-menu>
            <div>
                <paper-dropdown-menu id="filterSelect" label="Filter by">
                    <paper-listbox selected="{{filterBy}}" slot="dropdown-content" class="dropdown-content" attr-for-selected="value">
                        <template id="repeat" is="dom-repeat" items="[[filterOptions]]">
                            <paper-item value="[[item.value]]">[[item.label]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-dropdown-menu>
                <paper-input id="filterString" type="search" name="filter" label="Filter" no-label-float="" value="{{filter}}" on-keyup="_handleEnter">
                    <iron-icon icon="search" on-click="_filter" slot="prefix"></iron-icon>
                </paper-input>
                <paper-autocomplete-suggestions id="autocomplete" for="filterString" source="[[_suggestions]]" remote-source=""></paper-autocomplete-suggestions>
            </div>
        </div>
        <div class="toolbar">
            <slot name="toolbar"></slot>
            <paper-button id="delete" title="i18n(delete)" class\$="[[_canModify(_allowModification)]]">
                <iron-icon icon="delete"></iron-icon>
                <span class="label"><i18n:text key="delete">Delete</i18n:text></span>
            </paper-button>
        </div>
        <div id="content"><slot></slot></div>

        <iron-ajax id="loadContent" verbose="" handle-as="text" method="get" on-response="_handleContent" on-error="_handleError"></iron-ajax>
        <iron-ajax id="autocompleteLoader" url="modules/autocomplete.xql" verbose="" handle-as="json" method="get" on-response="_updateSuggestions"></iron-ajax>

        <paper-dialog id="deleteDialog">
            <h2>Delete</h2>
            <paper-dialog-scrollable>
                <template is="dom-if" if="[[!_hasMultipleSelected(_file, _selected)]]"><p>Are you sure you want to delete the file [[_file]]?</p></template>
                <template is="dom-if" if="[[_hasMultipleSelected(_file, _selected)]]"><p>Are you sure you want to delete [[_selected.length]] files?</p></template>
            </paper-dialog-scrollable>
            <div class="buttons">
                <paper-button dialog-confirm="dialog-confirm" autofocus="" on-click="_confirmDelete">Yes</paper-button>
                <paper-button dialog-confirm="dialog-cancel">no</paper-button>
            </div>
        </paper-dialog>
`;
  }

  static get is() {
      return 'pb-browse-docs';
  }

  static get properties() {
      return {
          sortBy: {
              type: String,
              value: 'default',
              reflectToAttribute: true,
              observer: '_sort'
          },
          sortOptions: {
              type: Array,
              value: [
                  {
                      label: 'Modification Date',
                      value: 'default'
                  }
              ]
          },
          sortLabel: {
              type: String,
              value: 'Sort'
          },
          filter: {
              type: String
          },
          filterBy: {
              type: String,
              value: 'title'
          },
          filterOptions: {
              type: Array,
              value: [
                  {
                      label: 'Title',
                      value: 'title'
                  }
              ]
          },
          /** Id of the pb-login element to connect to */
          login: {
              type: String
          },
          /**
           * If set, requires the logged in user to be member of
           * the given group.
           */
          group: {
              type: String
          },
          _file: {
              type: String
          },
          _selected: {
              type: Array
          },
          _allowModification: {
              type: Boolean,
              value: false
          },
          _suggestions: {
              type: Array,
              value: []
          }
      };
  }

  constructor() {
      super();

      const sortParam = this.getParameter('sort');
      if (sortParam) {
          this.sortBy = sortParam;
      }

      const filterParam = this.getParameter('filter');
      if (filterParam) {
          this.filter = filterParam;
          this.filterBy = this.getParameter('filterBy', this.filterBy);
      }
  }

  connectedCallback() {
      super.connectedCallback();

      this.$.autocomplete.addEventListener('autocomplete-change', this._autocomplete.bind(this));
      afterNextRender(this, () => {
          const login = document.getElementById(this.login);
          if (!login) {
              console.error('<pb-restricted> connected pb-login element not found!');
              return;
          }
          this.subscribeTo('pb-login', (ev) => {
              this._allowModification = this._loggedIn(ev.detail.user, ev.detail.group);
          });
          this._allowModification = login.loggedIn && this._loggedIn(login.user, login.groups);
      });
  }

  getParameters(params) {
      params.sort = this.sortBy;
      if (this.filter) {
          params.filter = this.filter;
          params.browse = this.filterBy;
      }

      return params;
  }

  /**
   * returns selected documents.
   *
   * @returns {Array}
   */
  getSelected() {
      const selected = [];
      if (this.container) {
          document.querySelectorAll(this.container).forEach((container) =>
              container.querySelectorAll('.document-select paper-checkbox[checked]').forEach((checkbox) => {
                  selected.push(checkbox.value);
              })
          );
      } else {
          this.$.content.querySelectorAll('.document-select paper-checkbox[checked]').forEach((checkbox) => {
              selected.push(checkbox.value);
          });
      }
      return selected;
  }

  _filter() {
      this.setParameter('filter', this.filter);
      this.setParameter('filterBy', this.filterBy);
      this.pushHistory('filter docs');

      this.load();
  }

  _sort(newValue, oldValue) {
      if (typeof oldValue == 'undefined' || typeof newValue == 'undefined') {
          return;
      }

      this.setParameter('sort', this.sortBy);
      this.pushHistory('sort docs');

      this.load();
  }

  _onLoad(content) {
      this.$.delete.addEventListener('click', this._handleDelete.bind(this));
  }

  _handleDelete(target, ev) {
      const selected = this.getSelected();
      if (selected.length > 0) {
          this._selected = selected;
          this.$.deleteDialog.open();
      }
  }

  _hasMultipleSelected(_file, _selected) {
      return _selected && _selected.length > 0;
  }

  _hasOneSelected(_file, _selected) {
      return _file;
  }

  _confirmDelete() {
      if (!(this._file || this._selected)) {
          return;
      }

      let files;
      if (this._selected) {
          files = this._selected;
      } else {
          files = [this._file];
      }
      console.log('<pb-browse-docs> Deleting %o', this._file);
      const params = {
          action: 'delete',
          'docs[]': files
      };
      this._file = null;
      this._selected = null;
      this.load(params);
  }

  _loggedIn(user, groups) {
      if (user == null) {
          return false;
      }
      if (this.group) {
          if (!groups) {
              return false;
          }
          return groups.indexOf(this.group) > -1;
      }
      return true;
  }

  _canModify(allowModification) {
      return allowModification ? '' : 'hidden';
  }

  _autocomplete(ev) {
      this.$.autocompleteLoader.params = {
          query: ev.detail.option.text,
          field: this.filterBy
      };
      this.$.autocompleteLoader.generateRequest();
  }

  _updateSuggestions() {
      this.$.autocomplete.suggestions(this.$.autocompleteLoader.lastResponse);
  }

  _handleEnter(e){
      if(e.keyCode == 13){
          this._filter();
      }
  }
}

window.customElements.define(PbBrowseDocs.is, PbBrowseDocs);
