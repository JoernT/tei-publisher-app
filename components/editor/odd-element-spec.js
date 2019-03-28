import { PolymerElement } from '../assets/@polymer/polymer/polymer-element.js';
import { html } from '../assets/@polymer/polymer/lib/utils/html-tag.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button';
import '../assets/@polymer/iron-icons/iron-icons';
import '../assets/@polymer/iron-icon/iron-icon';
import '../assets/@polymer/paper-menu-button/paper-menu-button';
import '../assets/@polymer/paper-listbox/paper-listbox';
import '../assets/@polymer/paper-item/paper-item';
import '../assets/@polymer/iron-collapse/iron-collapse';
import '../assets/@polymer/polymer/lib/elements/dom-repeat';
import '../assets/@polymer/polymer/lib/elements/dom-if';
import './odd-model';


/**
 * represents an ODD `elementSpec` element
 *
 *
 * @customElement
 * @polymer
 */
class OddElementSpec extends PolymerElement {
  static get template() {
    return html`
        <style include="pb-common-styles">
            :host {
                display: block;
            }

            h1, h2, h3, h4, h5, h6 {
                font-family: "Oswald", Verdana, "Helvetica", sans-serif;
                font-weight: 400 !important;
            }

            input {
                vertical-align: middle;
            }

            .ident {
                display: inline-block;
                min-width: 180px;
            }

            :host([currentSelection]) > h3, :host([currentSelection]) > header{
                /*background-color:var(--paper-grey-300);*/
                /*outline: solid var(--paper-blue-grey-300);*/
                @apply --shadow-elevation-2dp;
            }

            h3{
                display:grid;
                grid-template-columns: 40px auto 200px;
            }
            h3 .controls{
                text-align: right;
                margin-right: 10px;
                display: none;
            }

            :host([currentSelection]) > h3 > .controls{
                display: inline-block;
            }

            #toggle{
                align-self:center;
            }

            h3 .ident{
                align-self: center;
             }

            paper-menu-button paper-icon-button{
                margin-left:-10px;
            }

            /*todo: this does not take effect*/
            iron-collapse.models{
                --iron-collapse-transition-duration:0.6s;
            }
        </style>

        <h3>
            <paper-icon-button id="toggle" icon="[[toggleButtonIcon(show)]]" on-click="toggle"></paper-icon-button>
            <span class="ident">[[ ident ]]</span>

            <span class="controls">
                <paper-icon-button on-click="_remove" icon="delete"></paper-icon-button>
                <paper-icon-button on-click="_paste" icon="content-paste"></paper-icon-button>
                <paper-menu-button>
                    <paper-icon-button icon="add" slot="dropdown-trigger"></paper-icon-button>
                    <paper-listbox id="addModel" slot="dropdown-content" on-iron-select="_addModel" attr-for-selected="value">
                        <paper-item value="model">model</paper-item>
                        <paper-item value="modelSequence">modelSequence</paper-item>
                        <paper-item value="modelGrp">modelGrp</paper-item>
                    </paper-listbox>
                </paper-menu-button>

            </span>
        </h3>

        <iron-collapse id="models" class="models" opened="{{show}}">
            <div class="collapse-content">
                <template id="modelList" is="dom-repeat" items="{{models}}" as="model" mutable-data="">
                    <template is="dom-if" if="{{show}}">
                        <odd-model behaviour="{{model.behaviour}}" predicate="{{model.predicate}}" type="{{model.type}}" output="{{model.output}}" css="{{model.css}}" template="{{model.template}}" models="{{model.models}}" parameters="{{model.parameters}}" desc="{{model.desc}}" sourcerend="{{model.sourcerend}}" renditions="{{model.renditions}}" show="{{model.show}}" on-model-remove="removeModel" on-model-move-up="moveModelUp" on-model-move-down="moveModelDown" on-click="_setCurrentSelection" on-item-toggled="_setCurrentSelection" on-model-connected="_refreshModel" parent-model="[[model]]">
                        </odd-model>
                    </template>
                </template>
            </div>
        </iron-collapse>
`;
  }

  static get is() {
      return 'odd-element-spec';
  }

  static get properties() {
      return {
          // identifier for this ´element-spec´
          ident: {
              type: String
          },
          /**
           * mode for an ´elementSpec` may be 'add', 'remove' or being undefined
           */
          mode: {
              type: String
          },
          /**
           * array of ODD `model` elements
           */
          models: {
              type: Array,
              value: () => []
          },
          /**
           * if true shows its models otherwise it's collapsed
           */
          show: {
              type: Boolean,
              value: false
          }
      };
  }

  /**
   *
   * @event element-spec-connected fires when this element is connected
   */
  connectedCallback() {
      super.connectedCallback();

      this.dispatchEvent(new CustomEvent('element-spec-connected', {
          detail: {target: this}
      }));

      this.$.models.addEventListener("opened-changed", function () {
          this.set('show', this.$.models.opened)

          if (!this.$.models.opened) { return; }

          this.dispatchEvent(new CustomEvent('element-spec-toggled', {
              detail: {target: this}
          }));
      }.bind(this));
  }

  /**
   * renders the list of models
   */
  render(){
      this.$.modelList.render();
  }

  /**
   * hide/show child elements of this `elementSpec`
   *
   * @param show
   * @returns {string}
   */
  toggleButtonIcon(show) {
      return (show ? 'expand-less' : 'expand-more')
  }

  /**
   * hide/show child elements of this `elementSpec`
   *
   * @param ev
   * @event item-toggled fires when opening/closing
   */
  toggle(ev) {
      ev.preventDefault();
      this.$.models.toggle();
      this.dispatchEvent(new CustomEvent('item-toggled', {}));
      // refreshEditors of all models here?
  }

  showModels() {
      this.$.models.show();
  }

  collapseModels() {
      this.$.models.hide();
  }

  addModel(newModel){
      this.unshift('models', newModel);
  }

  _addModel(e) {
      this.$.models.show();

      const newModel =  {
          behaviour: 'inline',
          predicate: '',
          type: this.$.addModel.selected,
          output: null,
          template: null,
          sourcerend: false,
          models: [],
          parameters: [],
          renditions: [],
          show: true
      };

      console.log('new model ', newModel);

      this.unshift('models',newModel);
      this.$.addModel.selected = null;

  }

  removeModel(ev) {
      console.log('removeModel ',ev);

      if (confirm('really delete?')) {
          const item = ev.currentTarget;
          const index = this.$.modelList.indexForElement(item);
          this.splice('models', index, 1);
      }
  }

  moveModelUp(ev) {
      const item = ev.currentTarget;
      const index = this.$.modelList.indexForElement(item);

      if (index === 0) {
          return;
      }
      const model = this.get(['models', index]);
      this.splice('models', index, 1);
      this.splice('models', index - 1, 0, model);
  }

  moveModelDown(ev) {
      const item = ev.currentTarget;
      const index = this.$.modelList.indexForElement(item);

      if (index === this.models.length) {
          return;
      }
      const model = this.get(['models', index]);
      this.splice('models', index, 1);
      this.splice('models', index + 1, 0, model);
  }


  _refreshModel(ev){
      console.log('refreshModel ', ev.detail.target);
      ev.detail.target.refreshEditors();
  }


  _remove(ev) {
      this.dispatchEvent(new CustomEvent('element-spec-removed', {
          detail: {target: this}
      }));
  }


  _paste(ev) {
      const editor = document.querySelector('odd-editor');
      this.dispatchEvent(new CustomEvent('odd-paste', {composed:true, bubbles:true, detail: {target: this}}));
  }

  _setCurrentSelection(e){
      e.preventDefault();
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('current-changed', {composed:true, bubbles:true, detail:{target: e.target}}));
  }
}

window.customElements.define(OddElementSpec.is, OddElementSpec);
