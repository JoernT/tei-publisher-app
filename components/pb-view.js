import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import './assets/@polymer/iron-ajax/iron-ajax.js';
import { afterNextRender } from './assets/@polymer/polymer/lib/utils/render-status.js';
import './pb-mixin.js';

/**
 * This is the main component for viewing text which has been transformed via an ODD.
 * The document to be viewed is determined by the `pb-document` element the property
 * `src` points to. `pb-view` can display an entire document or just a fragment of it
 * as defined by the properties `xmlId`, `nodeId` or `xpath`.
 *
 * You may also define optional parameters to be passed to the ODD in nested `pb-param`
 * tags. These parameters can be accessed within the ODD via the `$parameters` map. For
 * example, the following snippet is being used to output breadcrumbs above the main text
 * in the documentation view:
 *
 * ```xml
 * <section class="breadcrumbs">
 *      <pb-view id="title-view1" src="document1" subscribe="transcription">
 *          <pb-param name="mode" value="breadcrumbs"/>
 *      </pb-view>
 * </section>
 * ```
 *
 * ## CSS Mixins
 *
 * | Custom property | Description | Default|
 * | ----------------|-------------|--------|
 * |--pb-content-theme | Mixin applied to the content view | {}|
 * |--pb-footnotes | Mixin for formatting footnotes | {}|
 * |--pb-footnote-ref | Mixin for formatting footnote references | {}|
 * |--pb-highlight-theme | Mixin applied to matches in the text when displaying search results | {}|
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-view.html
 */
class PbView extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            .columns {
                display: grid;
                grid-template-columns: 50% 50%;
                grid-column-gap: 10px;
            }

            .margin-note {
                display: none;
            }

            @media (min-width: 769px) {
                .content.margin-right {
                    margin-right: 200px;
                }

                .margin-note {
                    background: rgba(153, 153, 153, 0.2);
                    display: block;
                    font-size: small;
                    margin-right: -200px;
                    margin-bottom: 5px;
                    padding: 5px 0;
                    float: right;
                    clear: both;
                    width: 180px;
                }

                .margin-note .n {
                  color: #777777;
                }
            }

            a[rel=footnote], pb-footnote-ref {
                @apply --pb-footnote-ref;
            }

            .footnotes {
                @apply --pb-footnotes;
            }

            .list dt {
                float: left;
            }

            .footnote .fn-number {
                float: left;

                @apply --pb-footnote-number;
            }

            .content {
                @apply --pb-content-theme;
            }

            .highlight {
                @apply --pb-highlight-theme;
            }
        </style>

        <div id="view">
            <div class="columns">
                <div id="column1"></div>
                <div id="column2"></div>
            </div>
            <div id="content"></div>
        </div>

        <iron-ajax id="loadContent" url="[[url]]" verbose="" handle-as="json" method="get" on-response="_handleContent"></iron-ajax>
`;
  }

  static get is() {
      return 'pb-view';
  }

  static get properties() {
      return {
          /**
           * The id of a `pb-document` element this view should display.
           * Settings like `odd` or `view` will be taken from the `pb-document`
           * unless overwritten by properties in this component.
           *
           * This property is **required** and **must** point to an existing `pb-document` with
           * the given id.
           *
           * Setting the property after initialization will clear the properties xmlId, nodeId and odd.
           */
          src: {
              type: String,
              observer: '_updateSource'
          },
          /**
           * The ODD to use for rendering the document. Overwrites an ODD defined on
           * `pb-document`. The odd should be specified by its name without path
           * or the `.odd` suffix.
           */
          odd: {
              type: String,
              reflectToAttribute: true
          },
          /**
           * The view type to use for paginating the document. Either `page`, `div` or `single`.
           * Overwrites the same property specified on `pb-document`. Values have the following meaning:
           *
           * Value | Displayed content
           * ------|------------------
           * `page` | content is displayed page by page as determined by tei:pb
           * `div` | content is displayed by divisions
           * `single` | do not paginate but display entire content at once
           */
          view: {
              type: String,
              reflectToAttribute: true
          },
          /**
           * An eXist nodeId. If specified, selects the root of the fragment of the document
           * which should be displayed. Normally this property is set automatically by pagination.
           */
          nodeId: {
              type: String,
              reflectToAttribute: true
          },
          /**
           * An xml:id to be displayed. If specified, this determines the root of the fragment to be
           * displayed. Use to directly navigate to a specific section.
           */
          xmlId: {
              type: Array,
              reflectToAttribute: true
          },
          /**
           * An optional XPath expression: the root of the fragment to be processed is determined
           * by evaluating the given XPath expression. The XPath expression should be absolute.
           * The namespace of the document is declared as default namespace, so no prefixes should
           * be used.
           *
           * If the `map` property is used, it may change scope for the displayed fragment.
           */
          xpath: {
              type: String,
              reflectToAttribute: true
          },
          /**
           * If defined denotes the local name of an XQuery function in modules/map.xql, which needs to be called
           * with the current root node and returns the node of a mapped fragment, eg. translation.
           *
           * Navigation in the document is still determined by the current root as defined through the `root`, `xpath`
           * and `xmlId` properties.
           */
          map: {
              type: String
          },
          /**
           * Message to display if no content was returned by the server.
           * Set to empty string to show nothing.
           */
          notFound: {
              type: String,
              value: "the server did not return any content"
          },
          /**
           * Modify browser history: if set, any load operation performed by this
           * element will generate a new history entry in the browser's history.
           * Only use this on one element on the page.
           */
          history: {
              type: Boolean,
              value: false
          },
          /**
           * The relative URL to the script on the server which will be called for loading content.
           */
          url: {
              type: String,
              value: "modules/lib/components.xql"
          },
          /**
           * The server returns footnotes separately. Set this property
           * if you wish to append them to the main text.
           */
          appendFootnotes: {
              type: Boolean,
              value: false
          },
          /**
           * Should matches be highlighted if a search has been executed?
           */
          highlight: {
              type: Boolean,
              value: false,
              reflectToAttribute: true
          },
          /**
           * CSS selector to find column breaks in the content returned
           * from the server. If this property is set and column breaks
           * are found, the component will display two columns side by side.
           */
          columnSeparator: {
              type: String
          },
          /**
           * The reading direction, i.e. 'ltr' or 'rtl'.
           */
          direction: {
              type: String,
              value: 'ltr'
          },
          toggleStates: {
              type: Object,
              readOnly: true,
              value: function() {
                  return {};
              }
          }
      };
  }

  constructor() {
      super();
      const id = this.getParameter('id');
      if (id && !this.xmlId) {
          this.xmlId = id;
      }

      const action = this.getParameter('action');
      if (action && action === 'search') {
          this.highlight = true;
      }
  }

  connectedCallback() {
      super.connectedCallback();

      const nodeId = this.getParameter('root');
      if (this.view === 'single') {
          console.log("Clearing node id");
          this.nodeId = null;
      } else if (nodeId && !this.nodeId) {
          this.nodeId = nodeId;
      }
  }

  ready() {
      super.ready();
      this.subscribeTo('pb-navigate', ev => {
          this.navigate(ev.detail.direction);
      });
      this.subscribeTo('pb-refresh', this._refresh.bind(this));
      this.subscribeTo('pb-toggle', ev => {
          this.toggle(ev.detail.selector, ev.detail.state);
      });
      this.subscribeTo('pb-zoom', ev => {
          this.zoom(ev.detail.direction);
      });

      this.wait(() => afterNextRender(this, () => this._refresh()));
  }

  /**
   * Returns the ODD used to render content.
   */
  getOdd() {
      return this.odd || this.getDocument().odd || "teipublisher";
  }

  getView() {
      return this.view || this.getDocument().view || "single";
  }

  /**
   * Trigger an update of this element's content
   */
  update() {
      this._load(this.nodeId);
  }

  _refresh(ev) {
      if (ev && ev.detail) {
          if (ev.detail.path) {
              const doc = this.getDocument();
              doc.path = ev.detail.path;
          }
          if (ev.detail.id) {
              this.xmlId = ev.detail.id;
          }
          this.odd = ev.detail.odd || this.odd;
          if (ev.detail.columnSeparator !== undefined) {
              this.columnSeparator = ev.detail.columnSeparator;
          }
          this.view = ev.detail.view || this.view;
          // clear nodeId if set to null
          if (ev.detail.position == null) {
              this.nodeId = null;
          } else {
              this.nodeId = ev.detail.position || this.nodeId;
          }
      }
      this._updateStyles();
      this._load(this.nodeId);
  }

  _load(pos) {
      const doc = this.getDocument();

      if (!doc.path) {
          console.log("No path");
          return;
      }

      const params = this.getParameters(pos);

      this._doLoad(params);
  }

  _doLoad(params) {
      this.emitTo('pb-start-update', params);

      console.log("<pb-view> Loading view with params %o", params);
      this._clear();
      this.$.loadContent.params = params;
      this.$.loadContent.generateRequest();
  }

  _updateStyles() {
      const oldLink = this.$.view.querySelector("link");
      if (oldLink) {
          oldLink.parentNode.removeChild(oldLink);
      }
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('type', 'text/css');
      link.setAttribute('href', 'transform/' + this.getOdd() + '.css' );

      this.$.view.appendChild(link);
  }

  _clear() {
      this.$.content.innerHTML = "";
      this.$.column1.innerHTML = "";
      this.$.column2.innerHTML = "";
  }

  _handleContent() {
      const resp = this.$.loadContent.lastResponse;
      if (!resp) {
          console.error('<pb-view> No response received');
          return;
      }
      if (resp.error) {
          if (this.notFound) {
              this.$.content.innerHTML = this.notFound;
          }
          this.emitTo('pb-end-update', null);
          return;
      }

      const elem = this._replaceContent(resp);

      this.next = resp.next;
      this.previous = resp.previous;
      this.nodeId = resp.root;
      if (this.xmlId && !this.map) {
          this.setParameter('root', this.nodeId);
          this.pushHistory('Navigate to xml:id');
      }
      this.xmlId = null;
      const eventOptions = {
          data: resp,
          root: elem,
          params: this.$.loadContent.params
      };
      this.emitTo('pb-update', eventOptions);
      this.emitTo('pb-end-update', null);
  }

  _replaceContent(resp) {
      const fragment = document.createDocumentFragment();
      const elem = document.createElement('div');
      fragment.appendChild(elem);
      elem.innerHTML = resp.content;

      if (this.columnSeparator) {
          this._replaceColumns(elem);
      } else {
          this.$.content.appendChild(elem);
      }

      if (this.appendFootnotes) {
          const footnotes = document.createElement('div');
          if (resp.footnotes) {
              footnotes.innerHTML = resp.footnotes;
          }
          this.$.content.appendChild(footnotes);
      }

      this._initFootnotes(this.$.content);

      this._applyToggles();

      return elem;
  }

  _replaceColumns(elem) {
      let cb;
      if (this.columnSeparator) {
          const cbs = elem.querySelectorAll(this.columnSeparator);
          // use last separator only
          if (cbs.length > 0) {
              cb = cbs[cbs.length - 1];
          }
      }

      if (!cb) {
          this.$.content.appendChild(elem);
      } else {
          const fragmentBefore = this._getFragmentBefore(elem, cb);
          const fragmentAfter = this._getFragmentAfter(elem, cb);
          if (this.direction === 'ltr') {
              this.$.column1.appendChild(fragmentBefore);
              this.$.column2.appendChild(fragmentAfter);
          } else {
              this.$.column2.appendChild(fragmentBefore);
              this.$.column1.appendChild(fragmentAfter);
          }
      }
  }

  _initFootnotes(content) {
      content.querySelectorAll('.note, .fn-back').forEach(elem => {
          elem.addEventListener('click', (ev) => {
              ev.preventDefault();
              var fn = this.$.content.querySelector(elem.hash);
              if (fn) {
                  fn.scrollIntoView();
              }
          });
      })
  }

  _getParameters() {
      const params = [];
      this.querySelectorAll('pb-param').forEach(function(param) {
          params['user.' + param.getAttribute('name')] = param.getAttribute('value');
      });
      return params;
  }

  /**
   * Return the parameter object which would be passed to the server by this component
   */
  getParameters(pos) {
      pos = pos || this.nodeId;
      const doc = this.getDocument();
      const params = this._getParameters();
      params.doc = doc.path;
      params.odd = this.getOdd() + '.odd';
      params.view = this.getView();
      if (pos) {
          params['root'] = pos;
      }
      if (this.xpath) {
          params.xpath = this.xpath;
      }
      if (this.xmlId) {
          params.id = this.xmlId;
      }
      if (this.highlight) {
          params.highlight = "yes";
      }
      if (this.map) {
          params.map = this.map;
      }

      return params;
  }

  /**
   * Load a part of the document identified by the given eXist nodeId
   *
   * @param {String} nodeId The eXist nodeId of the root element to load
   */
  goto(nodeId) {
      this._load(nodeId);
  }

  /**
   * Load a part of the document identified by the given xml:id
   *
   * @param {String} xmlId The xml:id to be loaded
   */
  gotoId(xmlId) {
      this.xmlId = xmlId;
      this._load();
  }

  /**
   * Navigate the document either forward or backward and refresh the view.
   * The navigation method is determined by property `view`.
   *
   * @param {string} direction either `backward` or `forward`
   */
  navigate(direction) {
      if (direction === 'backward') {
          if (this.previous) {
              if (!this.map) {
                  this.setParameter('root', this.previous);
                  this.pushHistory('Navigate backward');
              }
              this._load(this.previous);
          }
      } else {
          if (this.next) {
              if (!this.map) {
                  this.setParameter('root', this.next);
                  this.pushHistory('Navigate forward');
              }
              this._load(this.next);
          }
      }
  }

  /**
   * Zoom the displayed content by increasing or decreasing font size.
   *
   * @param {string} direction either `in` or `out`
   */
  zoom(direction) {
      const fontSize = window.getComputedStyle(this.$.view).getPropertyValue('font-size');
      const size = parseInt(fontSize.replace(/^(\d+)px/, "$1"));

      if (direction === 'in') {
          this.$.view.style.fontSize = (size + 1) + 'px';
      } else {
          this.$.view.style.fontSize = (size - 1) + 'px';
      }
  }

  toggle(selector, state) {
      this.toggleStates[selector] = state;
      this._applyToggles();
  }

  _applyToggles() {
      Object.keys(this.toggleStates).forEach((selector) =>
          this.$.view.querySelectorAll(selector).forEach((elem) => elem.toggle(this.toggleStates[selector]))
      );
  }

  _getFragmentBefore(node, ms) {
      const range = document.createRange();
      range.setStartBefore(node);
      range.setEndBefore(ms);

      return range.cloneContents();
  }

  _getFragmentAfter(node, ms) {
      const range = document.createRange();
      range.setStartBefore(ms);
      range.setEndAfter(node);

      return range.cloneContents();
  }

  _updateSource(newVal, oldVal) {
      if (typeof oldVal !== 'undefined' && newVal !== oldVal) {
          this.xpath = null;
          this.odd = null;
          this.xmlId = null;
          this.nodeId = null;
      }
  }

  /**
   * Fired before the element updates its content
   *
   * @event pb-start-update
   * @param {object} Parameters to be passed to the request
   */

  /**
   * Fired when the component received content from the server
   *
   * @event pb-update
   * @param {Object} data the raw data returned from the server
   * @param {HTMLElement} root the HTML element inserted as content
   * @param {Object} params the parameters sent to the server to request the content
   */

  /**
   * Fired after the element has finished updating its content
   *
   * @event pb-end-update
   */

  /**
   * When this event is received: navigate forward or backward in the document
   *
   * @event pb-navigate
   */

  /**
   * When this event is received: increase or decrease the font size of the content
   *
   * @event pb-zoom
   */

  /**
   * When received, refresh the current view using the parameters passed in the
   * event details.
   *
   * @event pb-refresh
   */
}

window.customElements.define(PbView.is, PbView);
