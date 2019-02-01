/*
`pb-facsimile-loader` preloads images

based upon 'img-loader' at <a href="https://github.com/ryanburns23/img-pan-zoom">img-pan-zoom</a>

but ported to ES6 syntax and using latest OpenSeaDragon lib.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { html } from '../@polymer/polymer/lib/utils/html-tag.js';

import { resolveUrl } from '../@polymer/polymer/lib/utils/resolve-url.js';
import { PolymerElement } from '../@polymer/polymer/polymer-element.js';
/**
 * `pb-facsimile-loader`
 *
 * A image loader used by pb-facsimile
 *
 * @customElement
 * @polymer
 */
class PbFacsimileLoader extends PolymerElement {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }
        </style>

        <img id="img" hidden="" src="[[src]]">
`;
  }

  static get is() {
      return 'pb-facsimile-loader';
  }

  static get properties() {
      return {
          /**
           * image src
           */
          src: {
              observer: '_srcChanged',
              type: String
          },
          /**
           * Read-only value that is true when the image is loaded.
           */
          loaded: {
              notify: true,
              readOnly: true,
              type: Boolean,
              value: false
          },
          /**
           * Read-only value that tracks the loading state of the image when the `preload`
           * option is used.
           */
          loading: {
              notify: true,
              readOnly: true,
              type: Boolean,
              value: false
          },
          /**
           * Read-only value that indicates that the last set `src` failed to load.
           */
          error: {
              notify: true,
              readOnly: true,
              type: Boolean,
              value: false
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
  }

  ready(){
      super.ready();

      var img = this.$.img;

      img.onload = function() {
          if (this.$.img.src !== this._resolveSrc(this.src)) return;
          this._setLoading(false);
          this._setLoaded(true);
          this._setError(false);
      }.bind(this);

      img.onerror = function() {
          if (this.$.img.src !== this._resolveSrc(this.src)) return;
          this._reset();
          this._setLoading(false);
          this._setLoaded(false);
          this._setError(true);
      }.bind(this);

      this._resolvedSrc = '';
  }

  _srcChanged (newSrc, oldSrc) {
      var newResolvedSrc = this._resolveSrc(newSrc);
      if (newResolvedSrc === this._resolvedSrc) return;
      this._resolvedSrc = newResolvedSrc;
      this._reset();
      this._load(newSrc);
  }

  _load (src) {
      if (src) {
          this.$.img.src = src;
      } else {
          this.$.img.removeAttribute('src');
      }
      this._setLoading(!!src);
      this._setLoaded(false);
      this._setError(false);
  }

  _reset () {
      this.$.img.removeAttribute('src');
      this._setLoading(false);
      this._setLoaded(false);
      this._setError(false);
  }

  _resolveSrc (testSrc) {
      var baseURI = /** @type {string} */(this.ownerDocument.baseURI);
      return (new URL(resolveUrl(testSrc, baseURI), baseURI)).href;
  }
}

window.customElements.define(PbFacsimileLoader.is, PbFacsimileLoader);
