import { html } from '../@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../@polymer/polymer/polymer-element.js';
/**
 * `pb-edit-xml`
 *
 * Allows to open a XML document for editing in eXide. The document may be given by using the `path` or `src'
 * attributes.
 *
 * @customElement
 * @polymer
 */
class PbEditXml extends PolymerElement {
  static get template() {
    return html`
        <style>
            :host {
                display: inline;
            }

            a {
                color: inherit;
                text-decoration: none;
            }
        </style>

        <a href="{{href}}" target="eXide" on-click="_handleClick" title="[[title]]"><slot></slot></a>
`;
  }

  static get is() {
      return 'pb-edit-xml';
  }

  static get properties() {
      return {
          /**
           * expects a context-absolute path to the document to edit e.g. '/db/apps/tei-publisher/mytext.xml'
           */
          path: {
              type: String
          },
          /**
           * optional id reference to a pb-document
           */
          src: {
              type: String
          },
          /**
           * HTML title to be used
           */
          title: {
              type: String
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
  }

  ready(){
      super.ready();
  }

  setPath(path) {
      this.path = path;
  }

  open() {
      let href = '/exist/apps/eXide/'
      let path = this.path;
      if (this.src) {
          const sourceComponent = document.getElementById(this.src);
          path = sourceComponent.getFullPath();
          href = sourceComponent.sourceView;
      }
      // try to retrieve existing eXide window
      const exide = window.open("", "eXide");
      if (exide && !exide.closed) {
          // check if eXide is really available or it's an empty page
          const app = exide.eXide;
          if (app) {
              console.log("using existing eXide to open %s", path);
              // eXide is there
              exide.eXide.app.findDocument(path);
              exide.focus();
          } else {
              console.log("opening new eXide for %s", path);
              window.eXide_onload = function() {
                  exide.eXide.app.findDocument(path);
              };
              // empty page
              exide.location = href;
          }
      }
  }

  _handleClick(ev) {
      ev.preventDefault();
      this.open();
  }
}

window.customElements.define(PbEditXml.is, PbEditXml);
