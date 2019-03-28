import { PolymerElement } from '../@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from '../@polymer/polymer/lib/utils/html-tag.js';
/**
 * A container for different views. Only one view will be shown at a time.
 * Provides a dropdown for the user to switch between views. Views are
 * lazy loaded and should be provided as one or more `<template>` elements.
 *
 * @customElement
 * @appliesMixin PbMixin
 * @polymer
 * @demo demo/pb-grid.html
 */
class PbPanel extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            app-toolbar {
                padding: 0;
                justify-content: space-between;
            }

            #content {
                overflow: auto;
                max-height: calc(var(--pb-panel-max-height) - 72px);
            }
        </style>

        <slot></slot>
        <app-toolbar>
            <paper-dropdown-menu id="menu" label="[[label]]">
                <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{_active}}">
                    <template id="repeat" is="dom-repeat" items="[[panels]]">
                        <paper-item>[[item]]</paper-item>
                    </template>
                </paper-listbox>
            </paper-dropdown-menu>
            <slot name="toolbar"></slot>
        </app-toolbar>
        <div id="content" class="panel"></div>
`;
  }

  static get is() {
      return 'pb-panel';
  }

  static get properties() {
      return {
          /**
           * the index of the active view
           */
          _active: {
              type: Number,
              value: 0,
              observer: '_update'
          },
          /**
           * the label displayed above the dropdown for selecting the view to show
           */
          label: {
              type: String,
              value: 'View'
          },
          /**
           * a name for each available panel, to be displayed in the dropdown
           */
          panels: {
              type: Array
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
  }

  ready() {
      super.ready();
  }

  _update(newVal, oldVal) {
      this._show(oldVal != undefined);
  }

  _show(update) {
      console.log('<pb-panel> showing panel %s', this._active);
      this.$.content.querySelectorAll('._pb_panel').forEach(div => div.style.display = 'none');
      const existingPanel = this.$.content.querySelector('._pb_panel' + this._active);
      if (existingPanel) {
          existingPanel.style.display = '';
      } else {
          const template = this._getActivePanel();
          const clone = document.importNode(template.content, true);
          const div = document.createElement('div');
          div.className = '_pb_panel _pb_panel' + this._active;
          div.appendChild(clone);
          this.$.content.appendChild(div);

          this.emitTo('pb-panel', {
              panel: this,
              active: this._active
          });

          if (update) {
              this.refresh();
          }
      }
  }

  _getActivePanel() {
      const templates = this.querySelectorAll('template');
      return templates[this._active];
  }

  refresh() {
      this.emitTo('pb-refresh', null);
  }
}

window.customElements.define(PbPanel.is, PbPanel);
