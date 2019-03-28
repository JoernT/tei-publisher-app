import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import {PbMixin} from './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import './assets/@polymer/polymer/lib/elements/dom-if.js';
import './assets/@polymer/iron-icons/iron-icons.js';
import './assets/@polymer/iron-icon/iron-icon.js';
import './assets/@polymer/paper-dialog/paper-dialog.js';
import './assets/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import './assets/@polymer/paper-input/paper-input.js';
import './assets/@polymer/paper-button/paper-button.js';
import './assets/@polymer/iron-ajax/iron-ajax.js';

/**
 * Handles login/logout. Shows a link which opens a login dialog if clicked.
 * If a user is logged in, clicking the link will log him out instead.
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 */
class PbLogin extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            paper-dialog {
                min-width: 320px;
                max-width: 640px;
                min-height: 128px;
            }

            paper-dialog h2 {
                background-color: #607D8B;
                padding: 16px 8px;
                margin-top: 0;
                color: #F0F0F0;

                @apply --pb-login-title;
            }

            a {
                @apply --pb-login-theme;
            }

            @media (max-width: 1024px) {
                .label {
                    display: none;
                }
            }

            #message {
                color: var(--paper-red-800);
            }
        </style>

        <a href="#" on-click="_show" title="[[user]]">
            <template is="dom-if" if="[[loggedIn]]">
                <iron-icon icon="[[logoutIcon]]"></iron-icon> <span class="label">[[logoutLabel]] [[user]]</span>
            </template>
            <template is="dom-if" if="[[!loggedIn]]">
                <iron-icon icon="[[loginIcon]]"></iron-icon> <span class="label">[[loginLabel]]</span>
            </template>
        </a>

        <paper-dialog id="loginDialog">
            <h2>Login</h2>
            <paper-dialog-scrollable>
                <form action="login">
                    <paper-input name="user" label="User" value="{{user}}"></paper-input>
                    <paper-input name="password" label="Password" type="password" value="{{password}}"></paper-input>
                    <input id="logout" type="hidden" name="logout">
                </form>
                <template is="dom-if" if="[[_invalid]]">
                    <p id="message">Wrong password or invalid user
                        <template is="dom-if" if="[[group]]">(must be member of group [[group]])</template>
                    </p>
                </template>
            </paper-dialog-scrollable>
            <div class="buttons">
                <paper-button autofocus="" on-click="_confirmLogin">Login</paper-button>
            </div>
        </paper-dialog>

        <iron-ajax id="checkLogin" url="/exist/apps/tei-publisher/login" handle-as="json" on-response="_handleResponse" method="GET"></iron-ajax>
`;
  }

  static get is() {
      return 'pb-login';
  }

  static get properties() {
      return {
          /** True if user is currently logged in */
          loggedIn: {
              type: Boolean,
              value: false
          },
          /**
           * The currently logged in user.
           */
          user: {
              type: String
          },
          /**
           * If set, only users being members of the specified group are
           * allowed to log in.
           */
          group: {
              type: String
          },
          /**
           * Array of groups the current user is a member of.
           */
          groups: {
              type: Array,
              value: []
          },
          /**
           * Label to show if not logged in
           */
          loginLabel: {
              type: String
          },
          /**
           * Label to show before user name if logged in
           */
          logoutLabel: {
              type: String
          },
          loginIcon: {
              type: String,
              value: 'account-circle'
          },
          logoutIcon: {
              type: String,
              value: 'supervisor-account'
          },
          password: {
              type: String
          },
          _invalid: {
              type: Boolean
          },
          _hasFocus: {
              type: Boolean,
              value: true
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
      window.addEventListener('blur', () => {
          this._hasFocus = false;
      });
      window.addEventListener('focus', () => {
          if (!this._hasFocus) {
              this._hasFocus = true;
              this.$.checkLogin.params = null;
              this.$.checkLogin.generateRequest();
          }
      });
  }

  ready(){
      super.ready();
  }

  _show(ev) {
      ev.preventDefault();
      if (this.loggedIn) {
          this.$.checkLogin.params = {
              logout: this.user
          };
          this.$.checkLogin.generateRequest();
      } else {
          this.$.loginDialog.open();
      }
  }

  _confirmLogin() {
      this.$.checkLogin.params = {
          user: this.user,
          password: this.password
      };
      this.$.checkLogin.generateRequest();
  }

  _handleResponse() {
      const resp = this.$.checkLogin.lastResponse;
      if (resp.user && this._checkGroup(resp)) {
          this.loggedIn = true;
          this.user = resp.user;
          this.groups = resp.groups;
          this._invalid = false;
          this.$.loginDialog.close();
      } else {
          this.loggedIn = false;
          this.password = null;
          if (this.$.loginDialog.opened) {
              this._invalid = true;
          }
      }
      this.emitTo('pb-login', resp);
  }

  _checkGroup(info) {
      if (this.group) {
          return info.groups && info.groups.indexOf(this.group) > -1;
      }
      return true;
  }

  /**
   * Fired on successful login.
   *
   * @event pb-login
   * @param {String} user logged in user
   * @param {Array<String>} groups groups the user is a member of
   */
}

window.customElements.define(PbLogin.is, PbLogin);
