/*
 todo: copy model
 todo: paste model
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '../assets/@polymer/polymer/polymer-element.js';

import { html } from '../assets/@polymer/polymer/lib/utils/html-tag.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button';
import '../assets/@polymer/iron-icons/iron-icons';
import '../assets/@polymer/iron-icon/iron-icon';
import '../assets/@polymer/polymer/lib/elements/dom-if';
import '../assets/@polymer/polymer/lib/elements/dom-repeat';
import '../assets/@polymer/paper-menu-button/paper-menu-button';
import '../assets/@polymer/paper-listbox/paper-listbox';
import '../assets/@polymer/paper-item/paper-item';
import '../assets/@polymer/iron-collapse/iron-collapse';
import '../assets/@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '../assets/@polymer/paper-input/paper-input';
import '../assets/@polymer/paper-checkbox/paper-checkbox';
import './odd-code-editor';
import '../assets/@cwmr/paper-autocomplete/paper-autocomplete';
import './odd-parameter';
import './odd-rendition';





/**
 * represents a ODD `model`
 *
 *
 * @customElement
 * @polymer
 */
class OddModel extends PolymerElement {
  static get template() {
    return html`
        <style include="pb-common-styles">
            :host {
                display: block;
            }

            form {
                margin-bottom: 8px;
            }

            paper-input, paper-autocomplete {
                margin-bottom: 16px;
            }

            .models {
                margin-top: 8px;
            }

            .btn, .btn-group {
                margin-top: 0;
                margin-bottom: 0;
            }

            header {
                background-color: #d1dae0;
            }

            header div {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            header h4 {
                padding: 4px 8px;
                margin: 0;
                display: grid;
                grid-template-columns: 40px 40% auto;
            }
            h4 .btn-group{
                text-align: right;
                display: none;
            }

            #toggle, .modelType{
                align-self:center;
            }

            header div.info {
                padding: 0 16px 4px;
                margin: 0;
                font-size: 85%;
                display: block;
                margin:-10px 0 10px 32px;
            }
            header div.info *{
                display: block;
                line-height: 1.2;
            }

            header .outputDisplay{
                text-transform: uppercase ;
            }
            header .description{
                font-style: italic;
            }

            header .predicate {
                color: #ff5722;
            }

            .predicate label, .template label {
                display: block;
                font-size: 12px;
                font-weight: 300;
                color: rgb(115, 115, 115);
            }

            .model-collapse {
                color: #000000;
                cursor: pointer;
            }

            .model-collapse:hover {
                text-decoration: none;
            }

            .behaviour {
                color: #ff5722;
            }

            .behaviour:before {
                content: ' [';
            }

            .behaviour:after {
                content: ']';
            }

            .group {
                margin: 0;
                font-size: 16px;
                font-weight: bold;
            }

            .group .title {
                /*text-decoration: underline;*/
            }

            .renditions, .parameters {
                padding-left: 16px;
                border-left: 3px solid #e0e0e0;
            }

            .renditions .group {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            .predicate .form-control {
                width: 100%;
            }

            .source {
                text-decoration: none;
                margin-bottom: 8px;
            }

            .selectOutput {
                margin-right: 10px;
            }

            :host([currentselection]) > form > header{
                @apply --shadow-elevation-4dp;
            }

            paper-menu-button paper-icon-button{
                margin-left:-10px;
            }

            /* need to play it save for FF */
            :host([currentselection]) > form > header > h4 > .btn-group{
                display: inline-block;
            }
            iron-collapse{
                margin-top:10px;
            }

            .renditions{
                margin-top:10px;
            }
            odd-code-editor{
                margin-bottom:30px;
            }
        </style>

        <form>
            <header>
                    <h4>
                        <paper-icon-button id="toggle" icon="{{toggleButtonIcon(show)}}" on-click="toggle" class="model-collapse"></paper-icon-button>
                        <span class="modelType">{{type}}<span class="behaviour" hidden\$="[[_isGroupOrSequence(type)]]">{{ behaviour }}</span></span>

                        <span class="btn-group">
                            <paper-icon-button on-click="moveDown" icon="arrow-downward" title="move down"></paper-icon-button>
                            <paper-icon-button on-click="moveUp" icon="arrow-upward" title="move up"></paper-icon-button>
                            <paper-icon-button on-click="remove" icon="delete" title="remove"></paper-icon-button>
                            <paper-icon-button on-click="_copy" icon="content-copy" title="copy"></paper-icon-button>
                            <paper-icon-button on-click="_paste" icon="content-paste" hidden\$="[[_isModel(type)]]"></paper-icon-button>


                            <template id="typeSelector" is="dom-if" if="[[_isGroupOrSequence(type)]]">
                                <paper-menu-button>
                                    <paper-icon-button icon="add" slot="dropdown-trigger"></paper-icon-button>
                                    <paper-listbox id="modelType" slot="dropdown-content" on-iron-select="addNested" attr-for-selected="value">
                                        <paper-item value="model">model</paper-item>
                                        <paper-item value="modelSequence">modelSequence</paper-item>
                                        <paper-item value="modelGrp">modelGrp</paper-item>
                                    </paper-listbox>
                                </paper-menu-button>
                            </template>

                        </span>
                    </h4>
                <div class="info">
                    <div class="outputDisplay">[[output]]</div>
                    <div class="description">{{desc}}</div>
                    <div class="predicate">{{predicate}}</div>
                <p></p>
            </div></header>

            <iron-collapse id="details" opened="{{show}}" class="details">

                <paper-dropdown-menu class="selectOutput" label="Output">
                    <paper-listbox id="output" slot="dropdown-content" attr-for-selected="value" selected="{{output}}">
                        <template id="outputList" is="dom-repeat" items="{{outputs}}" as="output">
                            <paper-item value="{{output}}">{{output}}</paper-item>
                        </template>
                    </paper-listbox>
                </paper-dropdown-menu>

                <paper-input id="desc" value="{{ desc }}" placeholder="[Document the model]" on-change="refresh" label="Description"></paper-input>

                <odd-code-editor id="predicate" code="{{predicate}}" mode="xquery" label="Predicate" placeholder="[Define further conditions that have to be met (in xquery)]" on-change="_updatePredicate"></odd-code-editor>

                <div hidden\$="{{_isGroupOrSequence(type)}}">
                    <paper-autocomplete id="behaviour" placeholder="[Behaviour]" text="{{ behaviour }}" label="Behaviour"></paper-autocomplete>
                    <paper-input id="css" value="{{ css }}" placeholder="[Define CSS class name (for external CSS)]" label="CSS Class"></paper-input>
                    <odd-code-editor id="template" code="{{template}}" mode="{{_templateMode(output)}}" label="Template" placeholder="[Define code template to apply to content]" on-change="_updateTemplate"></odd-code-editor>
                </div>

                <div class="parameters" hidden\$="[[_isGroupOrSequence(type)]]">
                    <div class="group">
                        <span class="title">Parameters</span>
                        <paper-icon-button icon="add" on-click="addParameter"></paper-icon-button>
                    </div>
                    <template id="parameterList" is="dom-repeat" items="{{parameters}}" as="parameter">
                        <odd-parameter name="{{ parameter.name }}" value="{{ parameter.value }}" on-parameter-remove="_removeParam" on-parameter-connected="_refreshParameters"></odd-parameter>
                    </template>
                </div>

                <div class="renditions" hidden\$="[[_isGroupOrSequence(type)]]">
                    <div class="group">
                        <div>
                            <span class="title">Renditions</span>
                            <paper-icon-button icon="add" on-click="addRendition"></paper-icon-button>
                        </div>
                        <div class="source">
                            <paper-checkbox checked\$="{{ sourcerend }}" id="sourcerend">Use source rendition
                            </paper-checkbox>
                        </div>
                    </div>
                    <template id="renditionList" is="dom-repeat" items="{{ renditions }}" as="rendition">
                        <odd-rendition scope="{{ rendition.scope }}" css="{{ rendition.css }}" events="{{ events }}" on-remove-rendition="_removeRendition" on-rendition-connected="_refreshRendition"></odd-rendition>
                    </template>
                </div>
            </iron-collapse>

            <div class="models" hidden\$="[[_isModel(type)]]">
                <template id="modelList" is="dom-repeat" items="[[ models ]]" as="model">
                    <odd-model behaviour="{{ model.behaviour }}" predicate="{{ model.predicate }}" type="{{ model.type }}" output="{{ model.output }}" css="{{model.css}}" models="{{model.models}}" parameters="{{model.parameters}}" renditions="{{model.renditions}}" template="{{model.template}}" desc="{{ model.desc }}" sourcerend="{{ model.sourcerend }}" on-model-remove="removeModel" on-model-move-up="moveModelUp" on-model-move-down="moveModelDown" on-click="_setCurrentSelection" on-item-toggled="_setCurrentSelection" parent-model="[[model]]">
                    </odd-model>
                </template>
            </div>
        </form>
`;
  }

  static get is() {
      return 'odd-model';
  }

  static get properties() {
      return {
          /**
           * maps to ODD ´model` behaviour attribute
           */
          behaviour: {
              type: String,
              reflectToAttribute: true,
              notify: true
          },
          /**
           * maps to ODD `model` predicate
           */
          predicate: {
              type: String,
              value: '',
              reflectToAttribute: true,
              notify: true
          },
          type: {
              type: String,
              reflectToAttribute: true,
              notify: true
          },
          template: {
              type: String,
              reflectToAttribute: true,
              notify: true
          },
          output: {
              type: String,
              reflectToAttribute: true,
              notify: true
          },
          css: {
              type: String,
              notify: true
          },
          models: {
              type: Array,
              value: () => [],
              notify: true
          },
          parameters: {
              type: Array,
              value: () => [],
              notify: true
          },
          renditions: {
              type: Array,
              value: () => [],
              notify: true
          },
          desc: {
              type: String,
              notify: true,
              reflectToAttribute: true
          },
          sourcerend: {
              type: String,
              notify: true
          },
          show: {
              type: Boolean,
              value: false,
              reflectToAttribute: true,
              notify: true
          },
          outputs: {
              type: Array,
              value: ["",
                  "web",
                  "print",
                  "epub",
                  "fo",
                  "latex",
                  "plain"]
          },
          parentModel:{
              type: Array,
              reflectToAttribute: true,
              notify: true
          },
          behaviours:{
              type:Array,
              value:[
                  "alternate",
                  "anchor",
                  "block",
                  "body",
                  "break",
                  "cell",
                  "cit",
                  "document",
                  "figure",
                  "graphic",
                  "heading",
                  "inline",
                  "link",
                  "list",
                  "listItem",
                  "metadata",
                  "note",
                  "omit",
                  "paragraph",
                  "row",
                  "section",
                  "table",
                  "text",
                  "title",
                  "webcomponent"
              ]
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
      // console.log('odd-model connected', this);

      this.$.details.addEventListener("opened-changed", function () {
          this.set('show', this.$.details.opened)
      }.bind(this));

      if(this.current){
          this.dispatchEvent(new CustomEvent('current-changed', {composed:true, bubbles:true, detail:{target: this}}));
      }
      this.$.behaviour.source = this.behaviours;
      this.dispatchEvent(new CustomEvent('model-connected', {composed:true, bubbles:true, detail: {target: this}}));

  }

  /**
   * todo: unused function - remove
   *
   * @returns {models|{type}|{type, value}|{type, value, notify}|*}
   */
  getModel(){
      return this.models;
  }

  render(){
      this.$.modelList.render();
  }

  refreshEditors () {
    this.$.predicate.refresh();
    this.$.template.refresh();

    const models = this.shadowRoot.querySelectorAll('odd-model');
    for (let i = 0; i < models.length; i++) {
        models[i].refreshEditors();
    }
    const renditions = this.shadowRoot.querySelectorAll('odd-rendition');
    for (let i = 0; i < renditions.length; i++) {
        renditions[i].refreshEditor();
    }
    const parameters = this.shadowRoot.querySelectorAll('odd-parameter');
    for (let i = 0; i < parameters.length; i++) {
        parameters[i].refreshEditor();
    }
  }

  toggle(e) {
      console.log('odd-model.toggle ', e.composedPath());
      this.$.details.toggle();

      this.refreshEditors()
  }

  toggleButtonIcon(show) {
      return (show ? 'expand-less' : 'expand-more')
  }

  remove(e) {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('model-remove'));
  }

  /**
   * move model down in list
   *
   * @param e
   * @event model-move-down dispatched to request the model to move down
   */
  moveDown(e) {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('model-move-down'));
  }

  /**
   * move model up in list
   *
   * @param e
   * @event model-move-up dispatched to request the model to move up
   */
  moveUp(e) {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('model-move-up'));
  }

  /**
   * add a model to the array of models
   *
   * @param model
   */
  addModel(model){
      console.log('model.addModel ', model);
      this.unshift('models',model);
  }

  /**
   * remove a model from the array
   *
   * @param ev
   */
  removeModel(ev) {
    // TODO test if:  const item = ev.currentTarget; works
      const item = ev.composedPath()[0];
      const index = this.$.modelList.indexForElement(item);
      if (confirm('really delete?')) {
          this.splice('models', index, 1);
      }
  }

  /**
   * move model up in list
   *
   * @param ev
   */
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

  /**
   * move model down in list
   *
   * @param ev
   */
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

  /**
   * add a model parameter
   *
   * @param e
   */
  addParameter(e) {
      this.push('parameters', {name: "", value: ""});
  }

  /**
   * add a rendition
   *
   * @param ev
   */
  addRendition(ev) {
      this.push('renditions', {
          scope: null,
          css: ''
      });
  }

  /**
   * remove a rendition
   *
   * @param item
   */
  removeRendition(item) {
      const index = this.renditions.indexOf(item);
      this.splice('renditions', index, 1);
  }

  /**
   * refresh the predicate editor
   */
  refreshPredicateEditor(){
      console.log('refreshPredicateEditor');
      this.$.predicate.refresh();
  }

  /**
   * refresh the rendition editor
   *
   * @param ev
   * @private
   */
  _refreshRendition(ev){
      ev.detail.target.refreshEditor();
  }

  _refreshParameters(ev){
      console.log('_refreshParameters ', ev.detail);
      ev.detail.target.refreshEditor();
  }

  _copy(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      console.log('odd-model.copy ', ev);
      console.log('odd-model.copy data', this.parentModel);

      this.dispatchEvent(new CustomEvent('odd-copy', {composed:true, bubbles:true, detail: {model: this.parentModel}}));
  }

  _paste(ev) {
      console.log('model _paste ',ev);
      this.dispatchEvent(new CustomEvent('odd-paste', {composed:true, bubbles:true, detail: {target: this}}));
  }


  addNested(ev) {
      this.unshift('models', {
          behaviour: 'inline',
          predicate: '',
          type: ev.detail.item.getAttribute('value'),
          output: null,
          sourcerend: false,
          models: [],
          parameters: [],
          renditions: [],
          show: true
      });
      //important to reset the listbox - otherwise next attempt to use it will fail if value has not changed
      //use querySelector here instead of 'this.$' as listbox is in it's own <template>
      const modelTypeSelector = this.shadowRoot.querySelector('#modelType')
      modelTypeSelector.select("");
  }

  _isGroupOrSequence(type) {
      return type !== 'model';
  }

  _isModel(type) {
      return type === 'model';
  }

  _hasNoPredicate(predicate) {
      return !predicate;
  }

  _updatePredicate(ev){
      this.predicate = this.$.predicate.getSource();
  }

  _updateTemplate(ev) {
      this.template = this.$.template.getSource();
  }

  _removeParam(e) {
      const index = this.$.parameterList.indexForElement(e.target);
      this.splice('parameters', index, 1);
  }

  _removeRendition(e) {
      const index = this.$.renditionList.indexForElement(e.target);
      this.splice('renditions', index, 1);
  }

  _setCurrentSelection(e){
//                console.log('model._setCurrentSelection: ', e.target);
      this.setCurrent(e.target);
      e.preventDefault();
      e.stopPropagation();
  }

  /**
   * set current model
   *
   * @param target
   * @event current-changed fired after current model changed
   */
  setCurrent(target){
      this.dispatchEvent(new CustomEvent('current-changed', {composed:true, bubbles:true, detail:{target: target}}));
  }

  _templateMode(output) {
      switch (output) {
          case 'latex':
              return 'latex';
          case 'web':
          default:
              return 'xml';
      }
  }
}

window.customElements.define(OddModel.is, OddModel);
