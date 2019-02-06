import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
/**
 * Create an internal link: clicking it will cause connected views to
 * update and load the corresponding document fragment defined by the
 * properties.
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-link.html
 */
class PbLink extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: inline;
            }

            a, a:link {
                @apply --pb-link-theme;
            }
        </style>

        <a href="#" on-click="_onClick"><slot></slot></a>
`;
  }

  static get is() {
      return 'pb-link';
  }

  static get properties() {
      return {
          /** Browse to an xml:id within the document */
          xmlId: {
              type: String
          },
          /** Browse to an eXist-internal node id, e.g. 3.5.6.1 */
          nodeId: {
              type: String
          },
          /** Browse to a different document */
          path: {
              type: String
          },
          /** Switch the ODD to use for display */
          odd: {
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

  _onClick(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      const params = {
          position: null
      };
      if (this.xmlId) {
          params.id = this.xmlId;
      } else if (this.nodeId) {
          params.position = this.nodeId;
      }
      if (this.path) {
          params.path = this.path;
      }
      if (this.odd) {
          params.odd = this.odd;
      }
      this.pushHistory('table of contents click');

      this.emitTo('pb-refresh', params);
  }

  /**
   * Fired when user clicks the link
   *
   * @event pb-refresh
   * @param {Object} Parameters as defined in properties
   */
}

window.customElements.define(PbLink.is, PbLink);
