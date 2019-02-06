import { PolymerElement } from './assets/@polymer/polymer/polymer-element.js';
import './pb-mixin.js';
import { html } from './assets/@polymer/polymer/lib/utils/html-tag.js';
import './assets/openseadragon/build/openseadragon/openseadragon.min.js';
import './assets/@polymer/polymer/lib/elements/dom-if';
import './assets/@polymer/paper-spinner/paper-spinner-lite';
import './pb-facsimile-loader';

/**
 * `pb-facsimile`
 *
 * Facsimile viewer based on OpenSeaDragon.
 *
 * @customElement
 * @polymer
 * @demo demo/pb-facsimile.html
 */
class PbFacsimile extends PbMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
                position: relative;
                background: transparent;
                height: var(--pb-facsimile-height, 500px);
            }

            #viewer {
                position: relative;
                height: 100%;
                width: 100%;
            }
/*
            pb-facsimile-overlay{
                position: absolute;
                top:0;
                right:0;
                bottom: 0;
                left: 0;
            }
*/

            paper-spinner-lite {
                opacity: 0;
                display: block;
                transition: opacity 700ms;
                position: absolute;
                margin: auto;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                z-index: 1;
                height: 70px;
                width: 70px;
                --paper-spinner-color: var(--img-pan-zoom-spinner-color, #2196F3);
                --paper-spinner-stroke-width: var(--img-pan-zoom-spinner-width, 5px);
                @apply --img-pan-zoom-spinner;
            }

            paper-spinner-lite[active] {
                opacity: 1;
            }

            [hidden] {
                display: none;
            }
        </style>

        <!-- Only preload regular images -->
        <template is="dom-if" if="[[!dzi]]">
            <paper-spinner-lite hidden\$="[[hideSpinner]]" active="[[loading]]"></paper-spinner-lite>
            <pb-facsimile-loader loaded="{{loaded}}" loading="{{loading}}" src="[[src]]"></pb-facsimile-loader>
        </template>

        <!-- Openseadragon -->
        <div id="viewer"></div>
        <!--<pb-facsimile-overlay id="overlay"></pb-facsimile-overlay>-->
`;
  }

  static get is() {
      return 'pb-facsimile';
  }

  static get properties() {
      return {
          // Image source
          src: {
              type: String
          },
          // Set to true if you are using a deep zoom image
          dzi: {
              type: Boolean,
              value: false
          },
          // Fade in new items added to the viewer
          fadeIn: {
              type: Boolean,
              value: true
          },
          // loading
          loading: {
              type: Boolean,
              readonly: true,
              notify: true
          },
          // hides spinner
          hideSpinner: {
              type: Boolean,
              value: false
          },
          // loaded
          loaded: {
              type: Boolean,
              readonly: true,
              notify: true,
              observer: "_loadedChanged"
          },
          /**
           *  Set to false to prevent the appearance of the default navigation controls.
           * Note that if set to false, the customs buttons set by the options
           * zoomInButton, zoomOutButton etc, are rendered inactive.
           */
          showNavigationControl: {
              type: Boolean,
              value: true
          },
          // Set to true to make the navigator minimap appear.
          showNavigator: {
              type: Boolean,
              value: false
          },
          /** If true then the 'Go home' button is displayed to go back to the original zoom and pan. */
          showHomeControl: {
              type: Boolean,
              value: true
          },
          /** If true then the 'Toggle full page' button is displayed to switch between full page and normal mode. */
          showFullPageControl: {
              type: Boolean,
              value: false
          },
          /**
           * Default zoom between: set to 0 to adjust to viewer size.
           */
          defaultZoomLevel: {
              type: Number,
              value: 0
          },
          /** The "zoom distance" per mouse click or touch tap.
           * Note: Setting this to 1.0 effectively disables the click-to-zoom feature
           * (also see gestureSettings[Mouse|Touch|Pen].clickToZoom/dblClickToZoom).
           */
          zoomPerClick: {
              type: Number,
              value: 2.0
          },
          /** The "zoom distance" per mouse scroll or touch pinch.
           * Note: Setting this to 1.0 effectively disables the mouse-wheel zoom feature
           * (also see gestureSettings[Mouse|Touch|Pen].scrollToZoom}).
           */
          zoomPerScroll: {
              type: Number,
              value: 1.2
          },
          /**
           *
           * Specifies the animation duration per each OpenSeadragon.
           * Spring which occur when the image is dragged or zoomed.
           */
          animationTime: {
              type: Number,
              value: 1.2
          },
          /**
           * If true then the 'previous' button will wrap to the last
           * image when viewing the first image and the 'next' button
           * will wrap to the first image when viewing the last image.
           */
          navPrevNextWrap: {
              type: Boolean,
              value: false
          },
          /**
           * If true then the rotate left/right controls will be displayed
           * as part of the standard controls. This is also subject to the
           * browser support for rotate (e.g. viewer.drawer.canRotate()).
           */
          showRotationControl: {
              type: Boolean,
              value: false
          },
          /**
           *  The minimum percentage ( expressed as a number between 0 and 1 )
           * of the viewport height or width at which the zoom out will
           *  be constrained.
           * Setting it to 0, for example will allow you to zoom out infinity.
           */
          minZoomImageRatio: {
              type: Number,
              value: 1
          },
          /**
           *  The maximum ratio to allow a zoom-in to affect the highest
           * level pixel ratio. This can be set to Infinity to allow 'infinite'
           * zooming into the image though it is less effective visually
           * if the HTML5 Canvas is not availble on the viewing device.
           */
          maxZoomPixelRatio: {
              type: Number,
              value: 1.1
          },
          // Constrain during pan
          constrainDuringPan: {
              type: Boolean,
              value: false
          },
          /**
           *  The percentage ( as a number from 0 to 1 ) of the source image
           * which must be kept within the viewport.
           * If the image is dragged beyond that limit, it will 'bounce'
           * back until the minimum visibility ratio is achieved.
           * Setting this to 0 and wrapHorizontal ( or wrapVertical )
           * to true will provide the effect of an infinitely scrolling viewport.
           */
          visibilityRatio: {
              type: Number,
              value: 1
          },
          baseUri: {
              type: String,
              value: 'http://apps.existsolutions.com:8182/iiif/2/'
          },
          /**
           * Array of facsimiles
           *
           */
          facsimiles: {
            type: Array,
            value: function() { return [] }
          }
      };
  }

  static get observers() {
      return [
          // '_srcChanged(src)'
          '_facsimileObserver(init, facsimiles)'
      ]
  }

  constructor() {
    super();
  }

  connectedCallback() {
      super.connectedCallback();
      this._boundShowAnnotationListener = this._showAnnotationListener.bind(this);
      this._boundFragmentUpdateListener = this._fragmentUpdateListener.bind(this);
      this._boundClearAll = this._clearAll.bind(this);
      this.subscribeTo('pb-start-update', this._boundClearAll);
      this.subscribeTo('pb-update', this._boundFragmentUpdateListener);
      this.subscribeTo('pb-show-annotation', this._boundShowAnnotationListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // if (this._targetElements.length) {
    //   this._targetElements.forEach(element =>
    //     element.removeEventListener(
    //       'facsimile-show-annotation', this._boundShowAnnotationListener))
    //   this._targetElements[0].removeEventListener('update', this._boundFragmentUpdateListener);
    //   this._targetElements[0].removeEventListener('startupdate', this._boundClearAll);
    // }
  }

  ready() {
      super.ready();

      this.animationConfig = {
          'fade': {
              name: 'fade-in-animation',
              node: this.$.viewer
          }
      };

      this._initOpenSeadragon();

      this.signalReady();
/*
      window.addEventListener('WebComponentsReady', function (e) {
          console.log('onload overlay ', this.overlay);
          var rectangle = new paper.Rectangle(new paper.Point(50, 50), new paper.Point(150, 100));
          paper.view.draw();

      });
*/


  }

  // Init openseadragon
  _initOpenSeadragon() {

      // var tileSources = this.src;
      // if (!this.dzi) {
      //     tileSources = {
      //         type: 'image',
      //         url: this.src,
      //         buildPyramid: false
      //     }
      // }

      this.viewer = OpenSeadragon({
          element:            this.$.viewer,
          prefixUrl:          "resources/images/seadragon/",
          preserveViewport:   true,
          sequenceMode:       true,
          showZoomControl:    true,
          showHomeControl:    this.showHomeControl,
          showFullPageControl: this.showFullPageControl,
          showNavigator:      this.showNavigator,
          showNavigationControl: this.showNavigationControl,
          showRotationControl: this.showRotationControl,
          autoHideControls:   false,
          visibilityRatio:    1,
          minZoomLevel:       1,
          defaultZoomLevel:   this.defaultZoomLevel,
          constrainDuringPan: true
      });


      this.init = true;

      this.viewer.addHandler('open', this.resetZoom.bind(this));
      console.log("viewer: ", this.viewer);
  }

  _handlePress(e) {
      console.log('_handlePress ', e);
      console.log('_handlePress paper ', paper);
      console.log('_handlePress paper tools ', paper.tools);
  }

  //Function to destroy the viewer and clean up everything created by OpenSeadragon.
  destroy() {
      this.viewer.destroy();
      this.viewer = null;
  }

  // Zoom in
  zoomIn() {
      // TODO: Replace with native openseadragon zoomIn
      var currentZoom = this.viewer.viewport.getZoom();
      var maxZoom = this.viewer.viewport.getMaxZoom();
      var zoomTo = currentZoom + .7;
      if (zoomTo < maxZoom) {
          this.viewer.viewport.zoomTo(zoomTo);
      }
  }

  // Zoom out
  zoomOut() {
      // TODO: Replace with openseadragon native zoomOut
      var currentZoom = this.viewer.viewport.getZoom();
      var minZoom = this.viewer.viewport.getMinZoom();
      var zoomTo = currentZoom - .7;
      if (zoomTo > minZoom) {
          this.viewer.viewport.zoomTo(zoomTo);
      } else {
          if (minZoom != currentZoom) {
              this.resetZoom();
          }
      }
  }

  // reset zoom
  resetZoom() {
      this.viewer.viewport.goHome();
  }

  // returns the border styling for facsimile viewer
  getBorderStyle() {
    return '4px solid rgba(128, 0, 0, 0.5)'
  }

  _clearAll() {
    this.resetZoom()
    this.viewer.clearOverlays()
    this.set('facsimiles', [])
  }

  _srcChanged() {
      if (this.dzi && this.init) {
          // add tiled image
          // this._addTiledImage();
      }
  }

  // Add loaded images to viewer
  _loadedChanged() {
      // if (this.loaded) {
      //     if (!this.init) {
      //         this._initOpenSeadragon();
      //     } else {
      //         this._addImage();
      //     }
      // }
  }

  _addImage() {
      this.viewer.addSimpleImage({url: this.src, index: 0, replace: true});
  }

  _addTiledImage() {
      this.viewer.addTiledImage({tileSource: this.src, index: 0, replace: true});
  }

  _pageIndexByUrl(file) {
    return this.facsimiles.indexOf(file);
  }

  _showAnnotationListener(event) {
    console.log('_showAnnotationListener', event)
    const overlayId = 'runtime-overlay'

    // remove old overlay
    this.viewer.removeOverlay(this.overlay);

    // check event data for completeness
    if (!event.detail.file || event.detail.file === 0) {
      return console.error('file missing', event.detail)
    }

    if (
      event.detail.coordinates &&
      (!event.detail.coordinates[0] ||
      event.detail.coordinates.length !== 4)
    ) {
      return console.error('coords incomplete or missing', event.detail)
    }

    // find page to show
    const page = this._pageIndexByUrl(event.detail.file)

    if (page < 0) {
      return console.error('page not found', event.detail)
    }

    if (this.viewer.currentPage() !== page) {
        this.viewer.goToPage(page);
    }

    if (event.detail.coordinates) {
        // deconstruct given coordinates into variables
        const [x1, y1, w, h] = event.detail.coordinates;

        const currentRect = this.viewer.viewport.viewportToImageRectangle(
          this.viewer.viewport.getBounds(true));

        // scroll into view?
        if (!currentRect.containsPoint(new OpenSeadragon.Point(x1, y1))) {
            this.viewer.viewport.fitBoundsWithConstraints(
              this.viewer.viewport.imageToViewportRectangle(x1, y1, currentRect.width, currentRect.height));
        }

        // create new overlay
        const overlay = this.overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.border = this.getBorderStyle();

        // place marker
        const marker = this.viewer.viewport.imageToViewportRectangle(x1, y1, w, h);

        this.viewer.addOverlay({
            element: overlay,
            location: marker
        });
    }
    console.log('_showAnnotationListener', 'DONE')
  }

  _fragmentUpdateListener(event) {
    this.set('loaded', false)
    this.set('facsimiles', this._getFacsimilesFromData(event.detail.root))
    console.log('_boundFragmentUpdateListener', event.detail.content, this.facsimiles)
    this.set('loaded', true)
  }

  _getFacsimilesFromData(elem) {
      const facsimiles = [];
      elem.querySelectorAll('pb-facs-link').forEach(cb => {
          if (cb.facs) {
              facsimiles.push(cb.facs);
          }
      });
      console.log('_getFacsimilesFromData', facsimiles);
      return facsimiles;
  }

  _dedupeFacsimiles(deduped, nextMatch) {
      if (deduped.indexOf(nextMatch) < 0) { deduped.push(nextMatch) }
      return deduped
  }

  _facsimileObserver(init, facsimiles) {
    console.log(init,facsimiles)
    if (!init) { return }
    if (facsimiles.length === 0) { return this.viewer.close() }
    const uris = this.facsimiles.map(fac => `${this.baseUri}${fac}/info.json`)
    // console.log(uris)
    this.viewer.open(uris)
    this.viewer.goToPage(0)
  }
}

window.customElements.define(PbFacsimile.is, PbFacsimile);
