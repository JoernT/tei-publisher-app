import { PolymerElement } from '../assets/@polymer/polymer/polymer-element.js';
import './code-mirror-styles.js';
import './odd-codemirror-imports.js';
import { html } from '../assets/@polymer/polymer/lib/utils/html-tag.js';
import '../assets/@polymer/iron-ajax/iron-ajax';

/**
 * A code-editor based on CodeMirror supporting XML, XQuery and CSS
 *
 * Supports XQuery linting
 *
 * @customElement
 * @polymer
 * @demo demo/odd-code-editor.html
 */
class OddCodeEditor extends PolymerElement {
  static get template() {
    return html`
        <style include="code-mirror-styles">
            :host {
                display: block;
                width: 100%;
                margin: 0;
                position: relative;
            }
            #editorDiv {
              position: relative;
              top:0;
              left:0;
            }

            #editorDiv, .CodeMirror {
              width: 100%;
              height: auto;
            }

            .label {
                @apply --paper-font-caption;
            }
        </style>
        <iron-ajax id="lint" url="/exist/apps/tei-publisher/modules/editor.xql" handle-as="json" content-type="application/x-www-form-urlencoded" method="POST"></iron-ajax>

        <div class="label">[[label]]</div>
        <div id="editorDiv"></div>
`;
  }

  static get is() {
      return 'odd-code-editor';
  }

  static get properties() {
      return {
          /**
           * reference to actual CodeMirror object
           */
          _editor: {
              type: Object
          },
          /**
           * the code as a string
           */
          code: {
              type: String,
              value: '',
              observer: 'setSource',
              notify:true
          },
          /**
           * the language mode e.g. 'javascript' or 'xquery'.
           */
          mode: {
              type: String,
              value: "javascript"
          },
          /**
           * placeholder if code is empty
           */
          placeholder: {
              type: String,
              value: '[Empty]'
          },
          /**
           * tab indent size
           */
          tabSize: {
              type: Number,
              value: 2
          },
          /**
           * label for the editor
           */
          label:{
              type: String
          }
      }
  }

  connectedCallback() {
      super.connectedCallback();
  }

  ready(){
      super.ready();
      if(this.code){
          let code = this.code;
          this.code = code.trim();
      }
      const cm = CodeMirror(this.$.editorDiv, {
          value: this.code || '',
          mode: this.mode,
          lineNumbers: false,
          lineWrapping: true,
          autofocus: false,
          theme: "ttcn",
          matchBrackets: true,
          placeholder: this.placeholder,
          gutters: ["CodeMirror-lint-markers"],
          lint: true,
          viewportMargin: Infinity
      });

      cm.on('change',function(e){
          this.code = cm.getValue();
      }.bind(this));

      this._editor = cm;
      if(this.mode == 'xquery'){
          CodeMirror.registerHelper("lint", "xquery", this.lintXQuery.bind(this));
      }

  }

  /**
   * XQuery linting.
   *
   * calls server-side service for XQuery linting. Will return an array of linting errors or an empty array
   * if code is fine.
   *
   * @param text
   * @returns {*}
   */
  lintXQuery(text) {
      console.log('lintXQuery ', text);

      if (!text) {
          return [];
      }
      return new Promise(function(resolve, reject) {
          var params = {
              action: "lint",
              code: text
          };
          this.$.lint.params = null;
          this.$.lint.body = params;
          var request = this.$.lint.generateRequest();
          request.completes.then(function(req) {
              const data = req.response;
              if (data.status === 'fail') {
                  resolve([{
                      message: data.message,
                      severity: "error",
                      from: CodeMirror.Pos(data.line - 1, data.column),
                      to: CodeMirror.Pos(data.line - 1, data.column + 1)
                  }]);
              } else {
                  resolve([]);
              }
          }.bind(this));
      }.bind(this));
  }

  /**
   *
   * @returns the sourcecode
   */
  getSource() {
      return this._editor.getValue();
  }

  /**
   * pass code to editor for editing/display.
   *
   * @param newval
   */
  setSource(newval) {
      if (!this._editor || newval === this._editor.getValue()) {
          return;
      }
      const val = newval || ''
      this._editor.setValue(val);
      this._editor.refresh();
  }

  /**
   * call refresh() to update the view after external changes have occured. Might be needed after dynamic
   * changes of the UI.
   */
  refresh () {
    if (!this._editor) return;
    this._editor.refresh();
  }
}

window.customElements.define(OddCodeEditor.is, OddCodeEditor);
