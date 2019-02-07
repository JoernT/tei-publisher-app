import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import {PbMixin} from './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import './assets/@polymer/polymer/lib/elements/dom-if.js';
import './assets/@polymer/polymer/lib/elements/dom-repeat.js';

/**
 * `pb-paginate`
 *
 * paginator component to browse through server-generated lists.
 *
 * Uses pb-load for executing the actual requests to fetch a page.
 *
 * @see pb-load
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-search.html
 */
class PbPaginate extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;

                @apply --layout-horizontal;
                @apply --layout-center;
            }

            span {
                padding: 4px 8px;
                cursor: pointer;
            }

            .active {
                background-color: var(--paper-grey-800);
                color: white;
                border-radius: 50%;
                min-width: 1em;
                text-align: center;

                @apply --shadow-elevation-3dp;
            }

            .found {
                padding-left: 20px;
            }

        </style>

        <template is="dom-if" if="[[total]]">
            <span on-click="_handleFirst"><iron-icon icon="first-page"></iron-icon></span>
            <template is="dom-repeat" items="{{pages}}">
                <span class\$="[[item.class]]" on-click="_handleClick">[[item.label]]</span>
            </template>
            <span on-click="_handleLast"><iron-icon icon="last-page"></iron-icon></span>

            <span class="found">[[foundLabel]]: [[total]]</span>
        </template>
`;
  }

  static get is() {
      return 'pb-paginate';
  }

  static get properties() {
      return {
          /**
           * total number of pages
           */
          total: {
              type: Number,
              value: 0
          },
          /**
           * start page
           */
          start: {
              type: Number,
              value: 1
          },
          /**
           * amount of entries per page
           */
          perPage: {
              type: Number,
              value: 10
          },
          foundLabel: {
              type: String
          },
          /**
           * the current page
           */
          page: {
              type: Number,
              value: 1
          },
          /**
           * the amount of pages
           */
          pageCount: {
              type: Number,
              value: 10
          },
          /**
           * todo
           */
          range: {
              type: Number,
              value: 5
          },
          /**
           * todo:
           */
          pages: {
              type: Array,
              value: []
          }
      };
  }

  static get observers() {
    return [
      '_update(start,total)'
    ]
  }

  connectedCallback() {
      super.connectedCallback();

      this.subscribeTo('pb-results-received', this._refresh.bind(this));
  }

  ready() {
      super.ready();
  }

  _update(start, total) {
      if (!total || !start) {
          return;
      }
      this.pageCount = Math.ceil(total / this.perPage);
      this.page = Math.ceil(start / this.perPage);
      let lowerBound = Math.max((this.page - Math.ceil(this.range / 2) + 1), 1);
      let upperBound = Math.min((lowerBound + this.range - 1), this.pageCount);
      lowerBound = Math.max((upperBound - this.range + 1), 1);
      console.log("<pb-paginate> start: %d, total: %d, perPage: %d, pageCount: %s, page: %d, lower: %d, upper: %d",
          start, total, this.perPage, this.pageCount, this.page, lowerBound, upperBound);
      const pages = [];
      for (let i = lowerBound; i <= upperBound; i++) {
          pages.push({
              label: i,
              "class": i === this.page ? "active" : ""
          });
      }
      this.pages = pages;
  }

  _refresh(ev) {
      this.setProperties({
          start: ev.detail.start,
          total: ev.detail.count
      });
  }

  _handleClick(ev) {
      const index = ev.model.item.label
      const start = (index - 1) * this.perPage + 1;
      this.set('start', start);
      this.emitTo('pb-load', {
          "params": {
              "start": start,
              "per-page": this.perPage
          }
      });
  }

  _handleFirst(ev) {
      this.set('start', 1);
      this.emitTo('pb-load', {
          "params": {
              "start": 1,
              "per-page": this.perPage
          }
      });
  }

  _handleLast(ev) {
      const start = (this.pageCount - 1) * this.perPage + 1;
      this.set('start', start);

      this.emitTo('pb-load', {
          "params": {
              "start": start,
              "per-page": this.perPage
          }
      });
  }
}

window.customElements.define(PbPaginate.is, PbPaginate);
