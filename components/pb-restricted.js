import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import { afterNextRender } from './assets/@polymer/polymer/lib/utils/render-status.js';
import './assets/@polymer/polymer/lib/elements/dom-if';

/**
 * Show content if the user is logged in. Optionally requires the user
 * to be member of a specific group. Listens for the `pb-login` event
 * triggered by `pb-login` to be notified of user changes.
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 */
class PbRestricted extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }
        </style>

        <template is="dom-if" if="{{show}}">
            <slot></slot>
        </template>
`;
  }

  static get is() {
      return 'pb-restricted';
  }

  static get properties() {
      return {
          /** Id of the pb-login element to connect to */
          login: {
              type: String
          },
          show: {
              type: Boolean,
              value: false
          },
          /**
           * If set, requires the logged in user to be member of
           * the given group.
           */
          group: {
              type: String
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
  }

  ready() {
      super.ready();
      afterNextRender(this, () => {
          const login = document.getElementById(this.login);
          if (!login) {
              console.error('<pb-restricted> connected pb-login element not found!');
              return;
          }
          this.subscribeTo('pb-login', (ev) => {
              this.show = this._loggedIn(ev.detail.user, ev.detail.groups);
          });
          this.show = login.loggedIn && this._loggedIn(login.user, login.groups);
      });
  }

  _loggedIn(user, groups) {
      if (user == null) {
          return false;
      }
      if (this.group) {
          if (!groups) {
              return false;
          }
          return groups.indexOf(this.group) > -1;
      }
      return true;
  }
}

window.customElements.define(PbRestricted.is, PbRestricted);
