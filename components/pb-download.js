import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import {PbMixin} from './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
/**
 * Generate a link to download a resource. Optionally shows a dialog during the download.
 * This component is mainly used for creating the links for downloading PDFs, epubs etc.
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 */
class PbDownload extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            a {
                @apply --pb-download;
            }
        </style>
        <a id="button" title="[[title]]" target="[[_target]]" href="[[_href]]"><slot></slot></a>
`;
  }

  static get is() {
      return 'pb-download';
  }

  static get properties() {
      return {
          /**
           * optional id reference to a pb-document. If present the pb-download will allow to download the
           * referenced pb-document.
           */
          src: {
              type: String
          },
          /**
           * the base URL to construct the link from. If not specified, the path to the document will be used.
           */
          url: {
              type: String
          },
          /**
           * optional suffix to append to the constructed URL. Use for getting a PDF, epub or similar.
           */
          type: {
              type: String
          },
          /**
           * extra odd parameter to be added. This will correspond to the ODD used by the document, if given.
           */
          odd: {
              type: String
          },
          /**
           * id of dialog component to show when downloading. A paper-dialog component with this id must
           * exist.
           */
          dialog: {
              type: String
          },
          /**
           * title to show in the dialog while download is in progress
           */
          title: {
              type: String
          },
          /**
           * add a special parameter 'source=yes' if true. For PDF this will result
           * in generated source code to be displayed
           */
          source: {
              type: Boolean,
              value: false
          },
          /**
           *  extra params to be added
           */
          params: {
              type: String
          },
          _target: {
              type: String,
              value: false,
              computed: '_computeTarget(source)'
          },
          _href: {
              type: String,
              computed: '_computeURL(src, type, file, odd, params)'
          },
          _token: {
              type: String
          }
      };
  }

  ready() {
      super.ready();

      if (this.src) {
          this.subscribeTo('pb-document', (ev) => {
              if (ev.detail.id === this.src) {
                  this.odd = ev.detail.odd;
              }
          });
      }
      
      this.$.button.addEventListener('click', this._handleClick.bind(this));
  }

  _computeTarget(source) {
      return source ? '_blank' : '_self';
  }

  _computeURL(src, type, file, odd, params) {
      this._token = new Date().getTime() * 797;
      let url;
      const doc = this.getDocument();
      if (doc) {
          const file = this.url ? this.url : doc.getFileName();
          url = file + (this.type ?'.' + this.type : '') + '?odd=' + doc.odd + '.odd&cache=no&token=' + this._token;
      } else {
          url = this.url + (this.type ?'.' + this.type : '') + '?odd=' + this.odd + '&cache=no&token=' + this._token;
      }

      if (this.params) {
          url += '&' + this.params;
      }
      if (this.source) {
          url += '&source=yes';
      }
      return url;
  }

  /**
   *
   * triggers a document download
   *
   * @param ev
   * @private
   */
  _handleClick(ev) {
      if (this.dialog) {
          const dialog = document.getElementById(this.dialog);

          //todo: this will error when dialog is not found or defined on element.
          dialog.open();

          const downloadCheck = window.setInterval(() => {
              const cookieValue = Cookies.get("simple.token");
              if (cookieValue == this._token) {
                  window.clearInterval(downloadCheck);
                  Cookies.remove("simple.token");
                  dialog.close();
              }
          });
      }
      if (this._target === '_self') {
          ev.preventDefault();
          window.location = this._href;
      }
  }
}

window.customElements.define(PbDownload.is, PbDownload);
