import { PolymerElement } from '../../@polymer/polymer/polymer-element.js';
import { html } from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * Editor for ODD files
 *
 *
 * @customElement
 * @polymer
 */
class OddEditor extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style include="pb-common-styles">
            :host {
                display: flex;
                /*margin: 30px 20px;*/

                --paper-input-container: {
                    padding: 0;
                };

                --paper-dialog-title: {
                    margin-top: 0;
                    padding: 12px;
                    background-color: #607D8B;
                    color: #F0F0F0;
                };

                --pb-view-height: calc(100vh - 94px);
                --app-drawer-width:400px;


            }

            aside{
                flex-grow:1;
                margin-right:20px;
                width:380px;
                position: fixed;
            }
            section{
                flex-grow:3;
                margin-left:400px;
            }

            paper-card{
                display: flex;
                flex-direction:column;
                --paper-card-header: {
                    background-color: #607D8B;
                };

                --paper-card-header-text: {
                    font-family: "Oswald",Verdana,"Helvetica",sans-serif;
                    font-size: 16px;
                    font-weight: 400;
                    color: #F0F0F0;
                };

            }

            paper-card#drawercard h3{
                /*background-color: var(--paper-card-header_-_background-color);*/

                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;

            }


            /* ported over but not checked yet */

            .specs {
                flex: 3 0;
                /*height: var(--pb-view-height);*/
                overflow: auto;
                position: relative;
                max-width: 800px;
                padding:6px;
            }

            .metadata {
                display: block;
                width: 100%;

                --pb-collapse-trigger: {
                    background-color: #d1dae0;
                    padding-left: 10px;
                }
            }

            .metadata div {
                padding: 0 16px 16px;
            }

            .metadata paper-input {
                margin-bottom: 10px;
            }

            #jump-to {
                margin-top: 1em;
            }

            odd-model {
                border-bottom: 1px solid #E0E0E0;
            }
            odd-model h4 {
                margin-top: 15px;
                padding-top: 5px;
                border-top: 1px solid #E0E0E0;
            }
            .renditions {
                margin-top: 10px;
            }
            .CodeMirror {
                height: auto;
                margin-left: 10px;
                padding-bottom: 7px;
                margin-bottom: 7px;
                border-bottom: 1px solid #E0E0E0;
            }
            .CodeMirror-empty {
                color: #C0C0C0;
            }
            .icons{
                display:inline-block;
                white-space: nowrap;
            }

            /* todo: this doesn't work - should refactor to have the complete trigger exposed here (move out of pb-collapse) */
            pb-collapse#meta ::slotted(.collapse-trigger){
                /*height:56px;*/
            }

            iron-collapse{
                --iron-collapse-transition-duration:0.8s;
            }

        </style>

        <iron-ajax id="loadContent" url="/exist/apps/tei-publisher/modules/editor.xql" handle-as="json" content-type="application/x-www-form-urlencoded" method="GET"></iron-ajax>

        <iron-ajax id="saveOdd" url="/exist/apps/tei-publisher/modules/editor.xql" handle-as="json" content-type="application/x-www-form-urlencoded" method="POST"></iron-ajax>

        <aside>
            <paper-card id="drawercard" heading="Visual ODD Editor">
                <div class="card-content">
                    <slot id="slot"></slot>
                    <h3>
                        <span>[[odd]]</span>

                        <span class="icons">
                            <pb-edit-xml id="editSource"><paper-icon-button icon="code" title="ODD Source"></paper-icon-button></pb-edit-xml>
                            <paper-icon-button on-click="_reload" icon="refresh" title="Refresh"></paper-icon-button>
                            <paper-icon-button on-click="save" icon="save" title="Save" disabled\$="[[!loggedIn]]"></paper-icon-button>
                        </span>
                    </h3>
                    <div id="new-element" class="input-group">
                        <paper-input id="identNew" label="Add Element" always-float-label="always-float-label">
                            <paper-icon-button slot="suffix" on-click="addElementSpec" icon="add" tabindex="-1"></paper-icon-button>
                        </paper-input>
                    </div>

                    <div id="jump-to">
                        <paper-autocomplete id="jumpTo" label="Jump to ..." always-float-label="always-float-label"></paper-autocomplete>
                    </div>
                </div>
            </paper-card>
        </aside>

        <section class="specs" id="specs">

            <paper-card class="metadata">
                <pb-collapse id="meta">
                    <h4 slot="collapse-trigger" class="panel-title">
                        [[ _computedTitle(title, shortTitle, odd) ]]
                    </h4>
                    <div slot="collapse-content">
                        <paper-input id="title" name="title" value="{{title}}" label="Title" placeholder="[Title of the ODD]"></paper-input>
                        <paper-input id="titleShort" name="short-title" value="{{titleShort}}" label="Short title" placeholder="[Short title for display]"></paper-input>
                        <paper-input id="description" name="description" value="{{description}}" label="Description" placeholder="[Description of the ODD]"></paper-input>
                        <paper-input id="source" name="source" value="{{source}}" label="Source ODD" placeholder="[ODD to inherit from]"></paper-input>
                        <paper-checkbox id="useNamespace" checked="{{useNamespace}}" title="Check for using a different namespace than TEI"></paper-checkbox>
                        <paper-input id="namespace" name="namespace" value="{{namespace}}" label="Namespace" disabled="[[nsDisabled(useNamespace)]]" placeholder="[Default namespace URI (if not TEI)]"></paper-input>
                    </div>
                </pb-collapse>
            </paper-card>

            <template id="specList" is="dom-repeat" items="{{elementSpecs}}" as="item">
                <odd-element-spec id="es_{{item.ident}}" ident="{{item.ident}}" mode="{{item.mode}}" models="{{item.models}}" on-element-spec-connected="elementSpecConnectedHandler" on-element-spec-removed="removeElementSpec" on-element-spec-toggled="handleElementSpecToggle" on-click="_setCurrentSelection" on-item-toggled="_setCurrentSelection"></odd-element-spec>
            </template>
        </section>
        <odd-message id="dialog" hidden=""></odd-message>
`;
  }

  static get is() {
      return 'odd-editor';
  }

  static get properties() {
      return {
          ident:{
              type: String
          },
          /**
           * ElementSpec mode. Can be ´add´, ´change´ or undefined.
           */
          mode:{
              type: String
          },
          /**
           * Array of ´odd-model´ Elements
           */
          models:{
              type: Array
          },
          /**
           * the odd file being edited
           */
          odd: {
              type: String,
              observer: 'load',
              reflectToAttribute:true
          },
          /**
           * array of ´element-spec´ Elements of given odd file
           */
          elementSpecs: {
              type: Array,
              value: () => [],
          },
          source: {
              type: String,
              value: null
          },
          title: {
              type: String,
              value: null
          },
          titleShort: {
              type: String,
              value: null
          },
          description: {
              type: String,
              value: null
          },
          namespace: {
              type: String
          },
          rootPath:{
              type: String
          },
          currentItem: {
              type: Object,
              value: null
          },
          loading: {
            type: Boolean,
            value: false
          },
          indentString: {
              type: String,
              value: '    '
          },
          outputPrefix: {
              type: String,
              value: ''
          },
          outputRoot: {
              type: String,
              value: ''
          },
          currentSelection:{
              type: Object
          },
          useNamespace: {
            type: Boolean,
            value: false
        },
        loggedIn: {
            type: Boolean,
            value: true
        }
      };
  }

  // Observe changes to the users array
  static get observers() {
    return [
      '_specObserver(elementSpecs.splices)'
    ]
  }

  static get replaceCharMap ()  {
      return {
        '"': '&quot;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
      }
  }

  static get replaceCharRegexp() {
      return /"|&|<|>/g
  }

  static replaceChars (match) {
      return OddEditor.replaceCharMap[match];
  }

  constructor(){
      super();
  }

  connectedCallback() {
    super.connectedCallback();
    const pathname = window.location.pathname;
    this.basePath = pathname.substring(0,pathname.lastIndexOf('/components'));
//              console.log('basePath ', this.basePath );
//              console.log('odd param: ', this.odd);

    this.$.jumpTo.addEventListener('autocomplete-selected', this.jumpTo.bind(this));

    // wire up odd-selector
    // TODO inline odd-selector
    const oddSelector = this.querySelector('odd-selector');
//              console.log("odd prop: ", this.odd);

    if (this.odd) {
        oddSelector.selected = this.odd;
    }
    oddSelector.addEventListener('odd-selected', function (e) {
      if (confirm('Any unsaved changes will be lost. Continue?')) {
        this.odd = e.detail.odd;
        window.history.pushState({},"", '?odd=' + this.odd)
      }
      oddSelector.selected = this.odd;
    }.bind(this))

    this.addEventListener('current-changed', this._changeSelection);
    this.addEventListener('odd-copy', e => this._copy(e));
    this.addEventListener('odd-paste', e => this._paste(e));

      window.onbeforeunload = function () {
        return 'Any unsaved changes will be lost. Continue?';
      };

      this.subscribeTo('pb-login', (ev) => {
          this.loggedIn = ev.detail.user != null;
      });

      this.focus();
  }

  elementSpecConnectedHandler (ev) {
    if (this.loading) { return; }
//              console.log('set new connected odd-element-spec as currentItem', ev)
    this.setCurrentItem(ev.detail.target)
  }

  jumpTo () {
    const id = '#es_' + this.$.jumpTo.text;
    const target = this.shadowRoot.querySelector(id);

    if (!target) { return }
    this.$.jumpTo.clear();
    this.setCurrentItem(target)
  }

  _computedTitle (title, titleShort, odd) {
      if(!this.odd){
          return ''
      }
    return title || titleShort || odd || 'Loading ...'
  }

  _copy(e){
//                console.log('odd-editor._copy ', e);
      this.clipboard = e.detail.model;
      const clone = JSON.parse(JSON.stringify(e.detail.model));
      this.clipboard = clone;
  }

  _paste(e){
      if (this.clipboard == {}) { return; }
      const targetElement = e.detail.target;
      targetElement.addModel(this.clipboard);
      targetElement.render();
  }

  _specMapper (spec) {
     return {
       text: spec.ident,
       value: spec.ident
     };
  }

  _specObserver (changeRecord) {
//                console.log('_specObserver', changeRecord)
      const source = this.elementSpecs.map(this._specMapper);
      this.$.jumpTo.set('source', source);
  }


  load() {
      if (this.loading) { return; }
      this.loading = true;
      // reset
      this.set('elementSpecs', []);

      document.dispatchEvent(new CustomEvent('pb-start-update'));


      this.$.editSource.setPath(this.rootPath + '/' + this.odd);
      const params = { odd: this.odd, root: this.rootPath };
      this.$.loadContent.params = params;
      let request = this.$.loadContent.generateRequest();
      request.completes.then(function(req) {
          const data = req.response;
          this.source = data.source;
          this.title = data.title;
          this.titleShort = data.titleShort;
          this.description = data.description;

          this.namespace = data.namespace;
          this.useNamespace = (this.namespace != null);
//                    console.log('NAMESPACE', this.namespace, this.useNamespace);

          this.set('elementSpecs', data.elementSpecs);
          this.$.specList.render()

          this.loading = false
          document.dispatchEvent(new CustomEvent('pb-end-update'));

          // TODO init current selection
      }.bind(this));
  }
  _handleLoadResponse(){
      this.currentSelection = this.shadowRoot.querySelector('odd-element-spec');
      this.currentSelection.setAttribute('currentselection',true);
  }

  addElementSpec(ev) {
    const ident = this.$.identNew.value;
    if (!ident || ident.length === 0) {
        return;
    }
    const params = {
        action: "find",
        odd: this.odd,
        root: this.rootPath,
        ident: ident
    };
    this.$.loadContent.params = params;

    let request = this.$.loadContent.generateRequest();
    request.completes.then(this._handleElementSpecResponse.bind(this))
  }


  _handleElementSpecResponse(req) {
      const data = req.response;
      const ident = this.$.identNew.value
      const mode = (data.status === 'not-found' ? 'add' : 'change');
      const models = data.models || [];
      const newSpec = {
          ident: ident,
          mode: mode,
          models: models,
          show: true
      };

      this.push('elementSpecs', newSpec);
      // trigger update of autocomplete list in jumpTo
      this.$.identNew.value = '';
  }


  removeElementSpec(ev) {
//                console.log('removeElementSpec ', ev);

      if (confirm('really delete?')) {
          const index = this.$.specList.indexForElement(ev.detail.target);
          this.splice('elementSpecs', index, 1);
      }
  }

  /**
   *
   * @param ev
   * @event element-spec-toggle
   */
  handleElementSpecToggle(ev) {
    if (ev.detail.target === this.currentItem) { return; }
    this.setCurrentItem(ev.detail.target)
  }

  setCurrentItem(element) {
    if (this.currentItem) {
      this.currentItem.collapseModels();
    }

    this.set('currentItem', element)
//              console.log(this.currentItem)
    this.currentItem.showModels()
    this.currentItem.scrollIntoView();
  }

  serializeOdd() {
    const ns = this.useNamespace ? ` ns="${this.namespace}"` : '';
    const source = this.source ? ` source="${this.source}"` : '';
    const description = this.description ? ` <desc>${this.description}</desc>` : '';
    const title = `${this.indentString}<title>${this.title}${description}</title>\n`;
    const titleShort = this.titleShort ? `${this.indentString}<title type="short">${this.titleShort}</title>\n`: '';
    const elementSpecs = this.elementSpecs
      .map(e => this.serializeElementSpec(this.indentString, e))
      .join('')

    return `<schemaSpec xmlns="http://www.tei-c.org/ns/1.0" xmlns:pb="http://teipublisher.com/1.0"${ns}${source}>\n${title}${titleShort}${elementSpecs}</schemaSpec>\n`
  }

  serializeElementSpec (indent, elementSpec) {
    const mode = elementSpec.mode ? ` mode="${elementSpec.mode}"` : '';
    const indent2 = indent + this.indentString
    const models = elementSpec.models
      .map(m => this.serializeModel(indent2, m))
      .join('')

    return `${indent}<elementSpec ident="${elementSpec.ident}"${mode}>\n${models}${indent}</elementSpec>\n`;
  }

  serializeModel (indent, model) {
      if (model.type === 'model' && !model.behaviour) { return ''; }

      const nestedIndent = indent + this.indentString;

      const attributes = [
        this.serializeAttribute('output', model.output),
        this.serializeAttribute('predicate', model.predicate),
        model.type === 'model' ? this.serializeAttribute('behaviour', model.behaviour) : '',
        this.serializeAttribute('cssClass', model.css),
        this.serializeAttribute('useSourceRendition', model.sourcerend)
      ].join('')

      const desc = this.desc ? nestedIndent + '<desc>' + this.desc + '</desc>\n' : '';

      // innerXML += this.serializeTag('model', nestedIndent);
      const models = model.models
        .map(m => this.serializeModel(nestedIndent, m))
        .join('');
      const parameters = model.parameters
        .map(p => this.serializeParameter(nestedIndent, p))
        .join('');
      const renditions = model.renditions
        .map(r => this.serializeRendition(nestedIndent, r))
        .join('');
      const template = this.serializeTemplate(nestedIndent, model.template);
      const innerXML = `${desc}${models}${parameters}${template}${renditions}`;
      const end = (innerXML.length > 0) ? `>\n${innerXML}${indent}</${model.type}` : '/';

      return `${indent}<${model.type}${attributes}${end}>\n`
  }

  serializeParameter (indent, parameter) {
    if (!parameter.name) { return ''; }
    const name = this.serializeAttribute('name', parameter.name);
    const value = this.serializeAttribute('value', parameter.value);
    return `${indent}<param${name}${value}/>\n`
  }

  serializeRendition (indent, rendition) {
    const scope = this.serializeAttribute('scope', rendition.scope);
    const css = this.escape(rendition.css);
    return `${indent}<outputRendition xml:space="preserve" ${scope}>\n${indent}${css}\n${indent}</outputRendition>\n`;
  }

  serializeTemplate (indent, template) {
      if (!template) { return ''; }
      return `${indent}<pb:template xml:space="preserve" xmlns="">${template}</pb:template>\n`;
  }

  serializeAttribute (name, value) {
      return value ? ` ${name}="${this.escape(value)}"` : ''
  }

  escape(code) {
      if (!code) { return ''; }
      if (typeof code === 'string') {
          return code.replace(OddEditor.replaceCharRegexp, OddEditor.replaceChars);
      }
      return code;
  }

  save () {
    document.dispatchEvent(new CustomEvent('pb-start-update'));
    const data = this.serializeOdd()
    console.log('serialised ODD:', data)

    this.$.dialog.show("Saving ...");

    this.$.saveOdd.params = null;
    this.$.saveOdd.body = {
        action: "save",
        root: this.rootPath,
        "output-prefix": this.outputPrefix,
        "output-root": this.outputRoot,
        odd: this.odd,
        data: data
    };
    const request = this.$.saveOdd.generateRequest();
    request.completes
        .then(this.handleSaveComplete.bind(this))
        .catch(this.handleSaveError.bind(this));
  }

  _renderReport (report) {
      if (report.error) {
          return `
              <div class="list-group-item-danger">
                <h4 class="list-group-item-heading">${report.file}</h4>
                <h5 class="list-group-item-heading">Compilation error on line ${report.line}:</h5>
                <pre class="list-group-item-text">${report.error}</pre>
                <pre class="list-group-item-text">${report.message}</pre>
              </div>
          `;
      }
      return `
          <div class="list-group-item-success">
            <p class="list-group-item-text">Generated ${report.file}</p>
          </div>
      `;
  }

  handleSaveComplete (req) {
      const data = req.response;
      const report = data.report.map(this._renderReport);
      const msg = `<div class="list-group">${report.join('')}</div>`;
      this.$.dialog.set("Saved", msg);
      document.dispatchEvent(new CustomEvent('pb-end-update'));
  }

  handleSaveError (rejected) {
      this.$.dialog.set("Error", rejected.error);
      document.dispatchEvent(new CustomEvent('pb-end-update'));
  }

  _reload (e) {
      //todo: or should just the odd be loaded again?
      if (confirm('Any unsaved changes will be lost. Continue?')) {
        location.reload(true);
      }
  }

  _setCurrentSelection (e) {
//                console.log('editor._setCurrentSelection: ', e.target);
      if(this.currentSelection != undefined){
          this.currentSelection.removeAttribute('currentselection');
      }
      this.currentSelection = e.target;
      this.currentSelection.setAttribute('currentselection','true');
  }

  _changeSelection(e){
//                console.log('odd-editor._changeSelection ', e);

      if (e.detail.target == this) return;

      e.preventDefault();
      e.stopPropagation();
//                console.log('current-changed received ', e.detail.target);
//                console.log('current-changed received current', this.currentSelection);
      if(this.currentSelection != undefined){
          this.currentSelection.removeAttribute('currentselection');
      }
      const newSelection = e.detail.target;
      newSelection.setAttribute('currentselection','true');
      this.currentSelection = newSelection;
  }

  nsDisabled(useNamespace) { return !useNamespace }
}

window.customElements.define(OddEditor.is, OddEditor);
