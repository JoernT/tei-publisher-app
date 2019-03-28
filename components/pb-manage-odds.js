/*
<link rel="import" href="bower_components/paper-radio-button/paper-radio-button.html">
<link rel="import" href="bower_components/paper-button/paper-button.html">
<link rel="import" href="bower_components/app-layout/app-toolbar/app-toolbar.html">
<link rel="import" href="bower_components/paper-icon-button/paper-icon-button.html">
<link rel="import" href="bower_components/iron-form/iron-form.html">
<link rel="import" href="bower_components/paper-input/paper-input.html">
<link rel="import" href="pb-ajax.html">
<link rel="import" href="pb-edit-xml.html">
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '../@polymer/polymer/polymer-element.js';

import { html } from '../@polymer/polymer/lib/utils/html-tag.js';
import { beforeNextRender } from '../@polymer/polymer/lib/utils/render-status.js';
/**
 * `pb-manage-odds`
 *
 * a panel to manage ODD-files. Lists out all available ODD-files and dependent on your authorization
 * allow to view, edit and remove ODD-files. Also gives access to ODD-editor via linking each entry of the list.
 *
 * @customElement
 * @polymer
 */
class PbManageOdds extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            .odd {
                display: flex;
                flex-direction: row;
                align-items: center;
            }

            .odd paper-checkbox {
                display: block;
                flex: 0 0;
                margin-right: 1em;
            }

            .odd a {
                display: block;
                flex: 2 0;
            }

            .odd app-toolbar {
                flex: 1 0;
            }

            pb-restricted {
                display: flex;
            }

            .odd-description {
                color: #888888;
                font-size: 0.8em;
                margin-top: -1em;
            }
        </style>

        <template is="dom-repeat" items="{{odds}}">
            <div class="odd">
                <!--paper-radio-button checked\$="[[item.current]]" value="[[item.path]]" on-click="_selectODD"></paper-radio-button-->
                <a href\$="odd-editor.html?odd=[[item.name]].odd" target="_blank">[[item.label]]</a>
                <!-- TODO this toolbar should only appear once per ODD files papercard -->
                <app-toolbar>
                    <pb-restricted login="login">
                        <pb-ajax url\$="modules/lib/regenerate.xql?odd=[[item.name]].odd" dialog="messageDialog">
                            <paper-icon-button icon="update"></paper-icon-button>
                        </pb-ajax>
                        <paper-icon-button icon="delete" on-click="_delete"></paper-icon-button>
                    </pb-restricted>
                    <pb-edit-xml path\$="[[item.path]]">
                        <paper-icon-button icon="code"></paper-icon-button>
                    </pb-edit-xml>
                </app-toolbar>
            </div>
            <div class="odd-description">[[item.description]]</div>
        </template>
        <pb-restricted login="login">
            <iron-form id="ironform">
                <form>
                    <paper-input name="new_odd" label="File name of the ODD (without suffix)" required="" auto-validate="" pattern="[a-zA-Z0-9-_]+"></paper-input>
                    <paper-input name="title" label="Title for display" auto-validate="" required=""></paper-input>
                    <paper-button id="createBtn" on-click="_createODD"><iron-icon icon="create"></iron-icon>Create</paper-button>
                    <paper-button id="createByEx" on-click="_createByExample"><iron-icon icon="build"></iron-icon>Create from examples</paper-button>
                </form>
            </iron-form>
        </pb-restricted>

        <iron-ajax id="load" url="modules/lib/components-odd.xql" verbose="" handle-as="json" method="get" on-response="_update"></iron-ajax>

        <paper-dialog id="deleteDialog">
            <h2>Delete</h2>
            <paper-dialog-scrollable>
                <p>Are you sure you want to delete the ODD file [[file]]?
            
            </p><div class="buttons">
                <paper-button dialog-confirm="dialog-confirm" autofocus="" on-click="_confirmDelete">Yes</paper-button>
                <paper-button dialog-confirm="dialog-cancel">no</paper-button>
            </div>
        </paper-dialog-scrollable></paper-dialog>
`;
  }

  static get is() {
      return 'pb-manage-odds';
  }

  static get properties() {
      return {
          /**
           * array of ODD-files to be listed
           */
          odds: {
              type: Array
          },
          target: {
              type: String
          },
          _current: {
              type: String
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();

      this.$.ironform.addEventListener('change', (ev) => {
          // Validate the entire form to see if we should enable the `Submit` button.
          const valid = !this.$.ironform.validate();
          this.$.createBtn.disabled = valid;
          this.$.createByEx.disabled = valid;
      });
  }

  ready(){
      super.ready();

      beforeNextRender(this, function() {
          this._refresh();
      });
  }

  _refresh(params) {
      this.emitTo('pb-start-update');

      this.$.load.params = params;
      this.$.load.generateRequest();
  }

  _update() {
      this.emitTo('pb-end-update');

      this.set('odds', this.$.load.lastResponse);
  }

  _selectODD(ev) {
      const selected = ev.model.itemsIndex;
      this.odds.forEach((odd, index) => {
          if (index !== selected && odd.current) {
              this.set('odds.' + index + '.current', false);
              this.set('odds.' + selected + '.current', true);
          }
      });
      const params = { odd: ev.model.item.name + '.odd' };
      console.log('<pb-manage-odds> selected ODD: %o', params);

      this.emitTo('pb-load', {
          "params": params
      });
  }

  _createODD() {
      const params = this.$.ironform.serializeForm();
      console.log('<pb-manage-odds> create ODD: %o', params);
      this._refresh(params);
  }

  _createByExample() {
      const params = this.$.ironform.serializeForm();
      const fileBrowser = document.getElementById(this.target);
      if (!(fileBrowser || fileBrowser.getSelected)) {
          console.error('<pb-manage-odds> target %s not found', this.target);
      }
      const selected = fileBrowser.getSelected();
      document.querySelectorAll('.document-select paper-checkbox[checked]').forEach((checkbox) => {
          selected.push(checkbox.value);
      });
      console.log('<pb-manage-odds> create ODD by example: %o', selected);
      params['byExample'] = selected;
      this._refresh(params);
  }

  _delete(ev) {
      this._current = ev.model.item.path;
      this.$.deleteDialog.open();
  }

  _confirmDelete() {
      if (this._current) {
          console.log('<pb-manage-odds> deleting ODD: %s', this._current);
          this._refresh({ 'delete': this._current });
          this._current = null;
      } else {
          console.error('<pb-manage-odds> no file marked for deletion');
      }
  }
}

window.customElements.define(PbManageOdds.is, PbManageOdds);
