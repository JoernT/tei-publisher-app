import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import { beforeNextRender } from './assets/@polymer/polymer/lib/utils/render-status.js';
import './assets/@polymer/iron-ajax/iron-ajax';
/**
 * `<pb-load>`
 *
 * Dynamically load data by calling a server-side script, optionally triggered by an event.
 * This is used for e.g. the document list on the start page or the table
 * of contents.
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-load.html
 */
class PbLoad extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }
        </style>

        <div id="content"><slot></slot></div>

        <iron-ajax id="loadContent" verbose="" handle-as="text" method="get" on-response="_handleContent" on-error="_handleError"></iron-ajax>
`;
  }

  static get is() {
      return 'pb-load';
  }

  static get properties() {
      return {
          /** The URL for the AJAX request. If a relative URL is passed, it will be resolved
           * either against the app root (if known) or the location of the webcomponent.
           */
          url: {
              type: String
          },
          /** ID of the pb-document this element is connected to. The document path to
          * load will be taken from the pb-document.
           */
          src: {
              type: String
          },
          /**
           * The container element into which the results returned by
           * the AJAX request will be loaded.
           */
          container: {
              type: String
          },
          /**
           * Should content be loaded immediately when the component is initialized?
           */
          auto: {
              type: Boolean,
              value: false
          },
          /**
           * Only load content once, not every time a `pb-load` event is received.
           */
          loadOnce: {
              type: Boolean,
              value: false
          },
          /**
           * Start offset to use for showing paginated content.
           */
          start: {
              type: Number
          },
          history: {
              type: Boolean,
              value: false
          }
      };
  }

  constructor() {
      super();
      this.loaded = false;
      this.parameters = null;
  }

  connectedCallback() {
      super.connectedCallback();

      this.subscribeTo('pb-load', function(ev) {
          if (this.history && ev.detail && ev.detail.params) {
              const start = ev.detail.params.start;
              if (start) {
                  this.setParameter('start', start);
                  this.pushHistory('pagination', {
                      start: start
                  });
              }
          }
          this.load(ev);
      }.bind(this));

      if (this.history) {
          window.addEventListener('popstate', function(ev) {
              ev.preventDefault();
              if (ev.state && ev.state.start && ev.state.start !== this.start) {
                  this.start = ev.state.start;
                  this.load();
              }
          }.bind(this));
      }
  }

  ready() {
      super.ready();

      if (this.auto) {
          beforeNextRender(this, function() {
              this.start = this.getParameter('start', this.start);
              this.load();
          });
      }
  }

  load(ev) {
      if (this.loadOnce && this.loaded) {
          return;
      }

      this.emitTo('pb-start-update');

      const page = document.querySelector('pb-page');
      let appRoot;
      if (page) {
          appRoot = page.appRoot;
      }
      let url;
      if (appRoot) {
          url = [appRoot, this.url].join('/');
      } else {
          url = this.resolveUrl(this.url);
      }

      let params = {};

      if (ev) {
          if (ev instanceof Event) {
              if (ev.detail && ev.detail.params) {
                  params = ev.detail.params;
              }
          } else {
              params = ev;
          }
      }

      const doc = this.getDocument();
      if (doc) {
          params.doc = doc.path;
      }

      // set start parameter to start property, but only if not provided otherwise already
      if (this.start && !params.start) {
          params.start = this.start;
      }

      params = this.getParameters(params);

      console.log("<pb-load> Loading %s with parameters %o", this.url, params);
      this.$.loadContent.params = params;
      this.$.loadContent.url = url;
      this.$.loadContent.generateRequest();

      if (this.loadOnce) {
          this.loaded = true;
      }
  }

  /**
   * Allow subclasses to set parameters before the request is being sent.
   *
   * @param parameters Map of parameters
   * @return new or modified parameters map
   */
  getParameters(params) {
      return params;
  }

  _handleContent(ev) {
      this._parseHeaders(ev.detail.xhr);

      const resp = this.$.loadContent.lastResponse;
      if (this.container) {
          this.$.content.style.display = 'none';
          document.querySelectorAll(this.container).forEach((elem) => {
              elem.innerHTML = resp
              this._onLoad(elem);
          });
      } else {
          this.$.content.style.display = '';
          this.$.content.innerHTML = resp;
          this._onLoad(this.$.content);
      }

      this.emitTo('pb-end-update');
  }

  _handleError(ev) {
      this.emitTo('pb-end-update');
      const msg = this.$.loadContent.lastError.response;
      const parser = new DOMParser();
      const doc = parser.parseFromString(msg, "application/xml");
      const node = doc.querySelector('message');

      const dialog = document.getElementById('errorDialog');
      const body = dialog.querySelector("paper-dialog-scrollable");
      body.innerHTML = node.textContent;
      dialog.open();
  }

  _parseHeaders(xhr) {
      const total = xhr.getResponseHeader('pb-total');
      const start = xhr.getResponseHeader('pb-start');

      if (this.start !== start) {
          this.start = parseInt(start);
      }
      this.emitTo('pb-results-received', {
          "count": parseInt(total),
          "start": this.start
      });
  }

  _onLoad(content) {
  }

  /**
   * Fired before the element updates its content
   *
   * @event pb-start-update
   * @param {object} Parameters to be passed to the request
   */

  /**
   * Fired after the element has finished updating its content
   *
   * @event pb-end-update
   */

  /**
   * Fired after the element has received content from the server
   *
   * @event pb-results-received
   * @param {int} count number of results received (according to `pb-total` header)
   * @param {int} start offset into the result set (according to `pb-start` header)
   */
}

window.customElements.define(PbLoad.is, PbLoad);
