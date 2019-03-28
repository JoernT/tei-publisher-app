import { PolymerElement } from '../assets/@polymer/polymer/polymer-element.js';
import { html } from '../assets/@polymer/polymer/lib/utils/html-tag.js';
import '../assets/@polymer/paper-dialog/paper-dialog';
import '../assets/@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '../assets/@polymer/paper-button/paper-button';

/**
 * a confirmation dialog
 *
 *
 * @customElement
 * @polymer
 */
class OddMessage extends PolymerElement {
  static get template() {
    return html`
      <style include="pb-common-styles">
          :host {
              display: block;
          }
          paper-dialog {
              min-width: 420px;
              max-width: 640px;
              min-height: 128px;
          }

          paper-dialog h2 {
              background-color: #607D8B;
          }
        </style>

        <paper-dialog id="modal">
            <h2 id="title">Action</h2>
            <paper-dialog-scrollable id="message" class="message"></paper-dialog-scrollable>

            <div class="buttons">
                <paper-button dialog-confirm="dialog-confirm" autofocus="autofocus" hidden\$="[[isConfirm(type)]]">Close</paper-button>
                <paper-button id="confirm" dialog-confirm="dialog-confirm" autofocus="autofocus" hidden\$="[[isMessage(type)]]">Yes</paper-button>
                <paper-button dialog-confirm="dialog-confirm" autofocus="autofocus" hidden\$="[[isMessage(type)]]">No</paper-button>
            </div>
        </paper-dialog>
`;
  }

  static get is() {
      return 'odd-message';
  }

  static get properties() {
      return {
          type: {
              type: String,
              value: 'message'
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
  }

  show(title, message) {
      this.type = 'message';
      this.set(title, message);

      this.$.modal.open();
  }

  confirm(title, message) {
      this.type = 'confirm';
      this.set(title, message);
      this.$.modal.open();

      return new Promise(function(resolve, reject) {
          this.$.confirm.addEventListener('click', resolve, { once: true });
      }.bind(this));
  }

  set(title, message) {
      this.$.title.innerHTML = title;
      this.$.message.innerHTML = message || '';
  }

  isMessage(type) {
    return type === 'message'
  }

  isConfirm(type) {
    return type === 'confirm'
  }
}

window.customElements.define(OddMessage.is, OddMessage);
