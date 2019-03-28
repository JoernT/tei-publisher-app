import { PolymerElement } from '../@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from '../@polymer/polymer/lib/utils/html-tag.js';
/**
 * `pb-grid`
 *
 * A component to create a column layout based upon CSS grid. It offers methods for dynamically changing
 * the layout by adding or removing panels at runtime.
 *
 * @customElement
 * @polymer
 * @appliesMixin PbMixin
 * @demo demo/pb-grid.html
 */
class PbGrid extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
            }

            #grid {
                display: grid;
                grid-template-columns: var(--pb-column-widths, '1fr');
                grid-column-gap: var(--pb-column-gap, 20px);
            }
        </style>

        <div id="grid"></div>
`;
  }

  static get is() {
      return 'pb-grid';
  }

  static get properties() {
      return {
          /**
           * an array of panel items to display as columns
           */
          panels: {
              type: Array
          },
          direction: {
              type: String,
              value: 'ltr'
          },
          /**
           * the number of columns
           */
          _columns: {
              type: Number
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();

      this.subscribeTo('pb-panel', ev => {
          const idx = Array.from(this.$.grid.children).reverse().indexOf(ev.detail.panel);
          console.log('<pb-grid> Updating panel %d to show %s', idx, ev.detail.active);
          this.panels[idx] = ev.detail.active;

          this.setParameter('panels', this.panels.join('.'));
          this.pushHistory('added panel');
      });
  }

  ready() {
      super.ready();
      const panelsParam = this.getParameter('panels');
      if (panelsParam) {
          this.panels = panelsParam.split('.').map(param => parseInt(param));
      }
      this._columns = this.panels.length;
      this.template = this.querySelector('template');
      this._update();
      this.panels.forEach(panelNum => this._insertPanel(panelNum));
  }

  addPanel(initial) {
      this._columns++;
      this._update();
      this.panels.push(initial);

      this.setParameter('panels', this.panels.join('.'));
      this.pushHistory('added panel');

      this._insertPanel(initial);

      this.emitTo('pb-refresh', null);
  }

  removePanel(panel) {
      const idx = Array.from(this.$.grid.children).reverse().indexOf(panel);
      console.log('<pb-grid> Removing panel %d', idx);
      this.panels.splice(idx, 1);

      this.setParameter('panels', this.panels.join('.'));
      this.pushHistory('removed panel');

      panel.parentNode.removeChild(panel);
      this._columns--;
      this._update();
  }

  _insertPanel(active) {
      const clone = document.importNode(this.template.content.firstElementChild, true);
      clone.setAttribute('_active', active);
      if (this.direction === 'ltr' || this.$.grid.children.length === 0) {
          this.$.grid.appendChild(clone);
      } else {
          this.$.grid.insertBefore(clone, this.$.grid.firstElementChild);
      }
  }

  _update() {
      this.updateStyles({'--pb-column-widths': '1fr '.repeat(this._columns)});
  }
}

window.customElements.define(PbGrid.is, PbGrid);
