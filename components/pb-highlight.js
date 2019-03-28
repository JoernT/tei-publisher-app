import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import {PbMixin} from './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';

/**
 * Link elements to each other: if the user moves the mouse over one element,
 * the others are highlighted by changing their background color. Which elements
 * are linked is determined by the `key` property: elements with the same key
 * are linked. If the user moves the mouse over an element, the key is sent with
 * a `pb-highlight` event. Other elements with the same key react to this event.
 *
 * `pb-highlight` should be output for relevant elements via ODD processing model.
 *
 * ### Styling
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--pb-highlight-color` | Background color to highlight an element | #F9E976
 * `--pb-highlight` | Mixin applied to the element's content | `{ display: inline; }`

 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-highlight.html
 */
export class PbHighlight extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: inline;
            }

            @keyframes keyFrameBackgroundColorIn {
                0% {
                    background-color: inherit;
                }
                100% {
                    background-color: var(--pb-highlight-color, #F9E976);
                }
            }

            #content {
                display: inline;

                @apply --pb-highlight;
            }

            .highlight-on {
                background-color: var(--pb-highlight-color, #F9E976);
                animation-name: keyFrameBackgroundColorIn;
                animation-duration: 500ms;
                animation-iteration-count: 1;
                animation-timing-function: ease-in;

            }

            .highlight-off {
                background-color: inherit;
            }
        </style>

        <span id="content"><slot></slot></span>
`;
  }

  static get is() {
      return 'pb-highlight';
  }

  static get properties() {
      return {
          /**
           * The key to which this element is connected.
           */
          key: {
              type: String
          },
          /**
           * If set to > 0, specifies a duration (in ms) after which
           * the highlighting will be removed again
           */
          duration: {
              type: Number,
              value: 0
          },
          /**
           * Scroll this element into view when it receives a highlight event
           */
          scroll: {
              type: Boolean,
              value: false
          },
          highlightSelf: {
              type: Boolean,
              value: false
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();

      this.subscribeTo('pb-highlight-on', this._highlightOn.bind(this));
      this.subscribeTo('pb-highlight-off', this._highlightOff.bind(this));

      if (this.key) {
          this.addEventListener('mouseover', function(ev) {
              this.emitTo('pb-highlight-off', {
                  source: this
              });
              if (this.highlightSelf) {
                  this._highlightOn({detail: {id: this.key}});
              }
              this.emitTo('pb-highlight-on', {
                  id: this.key,
                  source: this,
                  scroll: this.scroll
              });
          }.bind(this));
      }
  }

  ready() {
      super.ready();
  }

  _highlightOn(ev) {
      if (ev.detail.source != this && ev.detail.id === this.key) {
          this.$.content.className = 'highlight-on';
          if (ev.detail.scroll) {
              this.scrollIntoView({behaviour: 'smooth'});
          }
          if (this.duration > 0) {
              setTimeout(function() {
                  this.$.content.className = 'highlight-off';
              }.bind(this), this.duration);
          }
      }
  }

  _highlightOff(ev) {
      if (ev.detail.source != this) {
          this.$.content.className = 'highlight-off';
      }
  }

  /**
   * Fired if mouse pointer enters the element
   *
   * @event pb-highlight-on
   * @param {String} id key
   * @param {Object} source this element
   * @param {scroll} should target scroll to highlighted position
   */

  /**
   * Fired if mouse pointer leaves the element
   *
   * @event pb-highlight-off
   * @param {Object} source this element
   */
}

window.customElements.define(PbHighlight.is, PbHighlight);
