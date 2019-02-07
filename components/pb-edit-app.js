import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import './assets/@polymer/polymer/lib/elements/dom-if.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import './assets/@polymer/iron-form/iron-form.js';
import './pb-select-odd.js';
import './assets/@polymer/paper-input/paper-input.js';
import './assets/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import './assets/@polymer/paper-listbox/paper-listbox.js';
import './assets/@polymer/paper-item/paper-item.js';
import './assets/@polymer/paper-button/paper-button.js';
import './assets/@polymer/polymer/lib/elements/dom-if.js';
import './assets/@polymer/iron-ajax/iron-ajax.js';

/**
 * `pb-edit-app`
 *
 * Editor component for the App Generator. Allows to edit all settings for an application.
 *
 * @customElement
 * @polymer
 */
class PbEditApp extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }
            paper-dropdown-menu {
                width: 100%;
                max-width: 864px;
            }
            fieldset {
                margin-top: 16px;
                padding: 0;
                border: 0;
            }
            legend {
                color: #909090;
            }

            paper-dialog {
                min-width: 420px;
                max-width: 640px;
                min-height: 128px;
            }

            paper-dialog h2 {
                background-color: #607D8B;
                padding: 16px 8px;
                margin-top: 0;
                color: #F0F0F0;
            }

            .content {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            .content a {
                display: block;
                flex: 1 0;
            }
        </style>

        <iron-form id="form">
            <form action="modules/components-generate.xql" method="POST" accept="application/json" enctype="application/json">
                <pb-select-odd id="odd" name="odd" label="ODD" odd="teipublisher"></pb-select-odd>
                <paper-input name="uri" type="url" required="" placeholder="http://exist-db.org/apps/my-simple-app" label="URL to uniquely identify the app" auto-validate=""></paper-input>
                <paper-input id="abbrev" name="abbrev" pattern="[a-zA-Z0-9-_]+" required="" placeholder="Short name" label="Short name to be used in URLs and file names" auto-validate=""></paper-input>
                <paper-input name="data-collection" pattern="[a-zA-Z0-9-_/]+" placeholder="data" label="Name of subcollection to hold TEI documents" auto-validate=""></paper-input>
                <paper-input name="title" required="" placeholder="Title of the app" label="Title of the app which will be shown e.g. in the dashboard"></paper-input>
                <fieldset>
                    <legend>Choose the HTML template to be used as default</legend>
                    <paper-dropdown-menu id="template" label="HTML Template" name="template">
                        <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="value" selected="view.html">
                            <template is="dom-repeat" items="[[templates]]">
                                <paper-item value\$="[[item.name]]">[[item.title]]</paper-item>
                            </template>
                        </paper-listbox>
                    </paper-dropdown-menu>
                </fieldset>
                <fieldset>
                    <legend>Choose what is shown by default when browsing text: a single page
                    or an entire division. Display by page requires that the TEI is properly marked up
                    with &lt;tei:pb&gt; tags.</legend>
                    <paper-dropdown-menu id="defaultView" label="Default View" name="default-view">
                        <paper-listbox slot="dropdown-content" class="dropdown-content" selected="div" attr-for-selected="value">
                            <paper-item value="div">By division (chapter/section...)</paper-item>
                            <paper-item value="page">By page</paper-item>
                        </paper-listbox>
                    </paper-dropdown-menu>
                </fieldset>
                <fieldset>
                    <legend>Define the smallest block on which a full text index is created. For documents
                    organized into divisions, choosing tei:div is usually best. If there are no divisions,
                    choose body.</legend>
                    <paper-dropdown-menu id="index" label="Default Full Text Index" name="index">
                        <paper-listbox slot="dropdown-content" class="dropdown-content" selected="tei:div" attr-for-selected="value">
                            <paper-item value="tei:div">Create on division</paper-item>
                            <paper-item value="tei:body">Create on body</paper-item>
                        </paper-listbox>
                    </paper-dropdown-menu>
                </fieldset>
                <fieldset>
                    <legend>User account for administrative tasks. The user will be created if it does not yet exist.</legend>
                    <paper-input name="owner" required="" placeholder="Username" label="The user account who will own the app." auto-validate=""></paper-input>
                    <paper-input name="password" type="password" required="" placeholder="Password" label="Password for the user owning this app." auto-validate=""></paper-input>
                </fieldset>
                <paper-button id="submit" on-click="_doSubmit"><iron-icon icon="save"></iron-icon> Save/Generate</paper-button>
            </form>
        </iron-form>
        <paper-dialog id="dialog">
            <h2>App generated</h2>
            <div id="dialogContent">
                <template is="dom-if" if="{{!error}}">
                    <a href\$="[[url]]" target="_blank">
                        <paper-button><iron-icon icon="icons:open-in-new"></iron-icon> Open</paper-button>
                    </a>
                    <p>Your app has been successfully generated!</p>
                </template>
                <template is="dom-if" if="{{error}}">
                    <div id="error">[[error]]</div>
                </template>
            </div>
            <div class="buttons">
                <paper-button dialog-dismiss="" autofocus="">Close</paper-button>
            </div>
        </paper-dialog>

        <iron-ajax id="getTemplates" url="modules/lib/components-list-templates.xql" handle-as="json" on-response="_handleTemplatesResponse" method="GET" auto=""></iron-ajax>
`;
  }

  static get is() {
      return 'pb-edit-app';
  }

  static get properties() {
      return {
          error: {
              type: String
          },
          url: {
              type: String
          },
          templates: {
              type: Array
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
  }

  ready(){
      super.ready();
      const self = this;
      this.$.form.addEventListener('iron-form-presubmit', function() {
          const view = self.$.defaultView.selectedItem.getAttribute('value');
          this.request.body['default-view'] = view;
          const index = self.$.index.selectedItem.getAttribute('value');
          this.request.body['index'] = index;
          this.request.body['odd'] = self.$.odd.odd;
          this.request.body['template'] = self.$.template.selectedItem.getAttribute('value');
      });
      this.$.form.addEventListener('iron-form-response', (event) =>
          event.detail.completes.then((r) => {
              this.emitTo('pb-end-update');
              const result = r.parseResponse();
              console.log('<pb-edit-app> Received response: %o', result);
              if (result.result === 'ok') {
                  const baseURL = window.location.href.replace(/^(.*)\/tei-publisher\/.*/, "$1");
                  this.url = baseURL + '/' + this.$.abbrev.value;
                  this.error = null;
              } else {
                  this.error = result.message;
              }
              this.$.dialog.open();
          })
      );
      this.$.form.addEventListener('iron-form-invalid', () =>
          this.emitTo('pb-end-update')
      );
  }

  _doSubmit() {
      this.emitTo('pb-start-update');
      this.$.form.submit();
  }

  _handleTemplatesResponse() {
      this.templates = this.$.getTemplates.lastResponse;
  }
}

window.customElements.define(PbEditApp.is, PbEditApp);
