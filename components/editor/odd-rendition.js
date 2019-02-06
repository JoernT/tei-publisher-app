import { PolymerElement } from '../assets/@polymer/polymer/polymer-element.js';
import '../assets/@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '../assets/@polymer/paper-listbox/paper-listbox';
import '../assets/@polymer/paper-item/paper-item';
import './odd-code-editor';
import '../assets/@polymer/paper-icon-button/paper-icon-button';
import '../assets/@polymer/iron-icons/iron-icons';
import '../assets/@polymer/iron-icon/iron-icon';



const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="odd-rendition">
    <template strip-whitespace="">
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            paper-dropdown-menu{
                margin-bottom:10px;
            }
            odd-code-editor{
                min-height:50px;
            }
            .actions{
                text-align: right;
            }

        </style>
        <paper-dropdown-menu label="Scope">
            <paper-listbox id="scopeList" slot="dropdown-content" selected="{{scope}}" attr-for-selected="value">
                <template id="specList" is="dom-repeat" items="{{scopes}}" as="scope">
                    <paper-item value="{{scope}}">{{scope}}</paper-item>
                </template>
            </paper-listbox>
        </paper-dropdown-menu>
        <!--<paper-textarea id="textarea" on-change="_handleChange" value="{{css}}">{{css}}</paper-textarea>-->

        <odd-code-editor id="editor" code="{{css}}" mode="css" on-change="_handleChange"></odd-code-editor>

        <div class="actions">
            <paper-icon-button on-click="_remove" icon="delete"></paper-icon-button>
        </div>

        <slot></slot>
    </template>

    
</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * `odd-rendition`
 *
 *
 * @customElement
 * @polymer
 */
class OddRendition extends PolymerElement {
    static get is() {
        return 'odd-rendition';
    }


    static get properties() {
        return {
            scopes: {
                type: Array,
                value: ["", "before", "after"]
            },
            css: {
                type: String,
                value: '',
                notify: true,
                reflectToAttribute: true
            },
            scope:{
                type: String,
                value:'',
                notify:true,
                reflectToAttribute:true,
                observer: '_scopeChanged'
            }

        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.css = this.css.trim();
        this.dispatchEvent(new CustomEvent('rendition-connected', {composed:true, bubbles:true, detail: {target: this}}));
    }

    ready(){
        super.ready();
        this.refreshEditor();
    }

    refreshEditor(){
        console.log('refreshEditor');
        this.$.editor.refresh();
    }


    /*
                show() {
                    this.$.css.initCodeEditor();
                }
    */

    _handleSelect(e){
        this.scope = this.$.scope.selected;
    }

    _remove(ev) {
        ev.preventDefault();
        this.dispatchEvent(new CustomEvent('remove-rendition', {}));
    }

    _handleChange() {
        this.css = this.$.editor.getSource();
    }

    _scopeChanged() {
        this.scope = this.$.scopeList.selected;
    }


}

window.customElements.define(OddRendition.is, OddRendition);
