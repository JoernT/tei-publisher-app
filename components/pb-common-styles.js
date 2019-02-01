const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="pb-common-styles">
<!--
    pb-common-styles contains all styling rules that are common to all components including it.


-->
    <template>
        <style>
            body {
                font-size: 16px;
                font-family: 'Roboto', 'Noto', sans-serif;
                line-height: 1.42857;
                font-weight: 300;
                margin: 0;
                color: #333333;

                --pb-footnote-ref: {
                    font-size: 75%;
                    vertical-align: top;
                    color: #333333;
                    text-decoration: none;
                    padding-left: .25em;
                };

                --pb-highlight-theme: {
                    background-color: #F9E976;
                };

                --pb-login-title: {
                    background-color: #607D8B;
                    padding: 16px 8px;
                    margin-top: 0;
                    color: #F0F0F0;
                    font-family: "Oswald",Verdana,"Helvetica",sans-serif;
                };

                --paper-tooltip: {
                    max-width: 400px;
                    font-size: 16px;
                    text-align: left;
                    line-height: 1.33;
                    background-color: var(--paper-grey-50);
                    color: #101010;
                    box-shadow: 2px 4px 14px rgba(0, 0, 0, 0.6);
                    border-radius: 6px;
                };

                --paper-tooltip-delay-in: 200;
            }

            app-toolbar {
                --app-toolbar-font-size: 16px;
            }

            app-toolbar pb-search {
                padding-left: 20px;
                --pb-search-input: white;
                --pb-search-label: var(--paper-grey-600);
            }

            app-drawer {
                --pb-lang-item-color: black;
                --pb-lang-input-color: black;
                --pb-lang-label-color: var(--paper-grey-600);
            }

            .drawer-content {
                overflow: auto;
                height: 100%;
                padding: 8px 10px;
                text-align: left;
            }

            .drawer-content pb-collapse h3 {
                margin-bottom: 0;
                margin-top: 0;
            }

            .drawer-content paper-listbox {
                margin: 0;
            }

            app-drawer .settings, app-drawer pb-collapse {
                display: flex;
                flex-direction: column;
            }

            app-drawer paper-listbox {
                width: 100%;
            }

            app-drawer a, app-drawer a:link {
                text-decoration: none;
                color: inherit;
            }

            app-drawer-layout:not([narrow]) [drawer-toggle] {
              display: none;
            }

            .toolbar {
                justify-content: space-between;
                background-color: #d1dae0;
            }

            [drawer-toggle] {
                padding-right: 0;
            }

            .menubar {
                justify-content: space-between;
                background-color: #35424b;
                color: white;

                --pb-download: {
                    text-decoration: none;
                    color: black;
                };
            }

            .menubar pb-media-query {
                flex: 1 0;
            }

            .menubar a, .menubar paper-menu-button {
                margin: 8px 8px;
                display: block;
                color: white;
                text-decoration: none;
            }

            .menubar .logo {
                margin: 0 16px 0 0;
            }

            .menubar .gitlab {
                margin-left: 16px;
                margin-right: 16px;
            }

            .menubar .gitlab img {
                background-size: 100% 100%;
                height: 40px;
            }

            .menubar pb-login {
                --pb-login-theme: {
                    margin: 0 0 0 16px;
                    display: block;
                    color: white;
                    text-decoration: none;
                }
            }

            .menubar pb-lang {
                text-align: right;
                flex: 1 0;
                --pb-lang-item-color: white;
            }

            .menubar paper-item a {
                color: black;
                margin: 0;
            }

            [main-title] {
                display: inline-block;
            }

            .logo img {
                width: 140px;
                height: 60px;
                background-size: 100% 100%;
                cursor: pointer;
            }

            pb-progress {
                width: 100%;
            }

            pb-view-type {
                font-size: .75em;
            }

            @media (max-width: 768px) {
                #downloadDialog {
                    width: 100%;
                }
            }

            @media (min-width: 769px) {
                #downloadDialog {
                    width: 50%;
                }
            }

            .breadcrumbs {
                margin: 10px 0 0 20px;
                font-weight: 400;
            }

            h1, h2, h3, h4, h5, h6 {
                font-family: "Oswald",Verdana,"Helvetica",sans-serif;
                font-weight: 400 !important;
                line-height: 1.2;
            }

            .alternate {
                display: inline-block;
            }

            .alternate .default {
                color: var(--pb-alternate-inline, --paper-blue-800);
            }

            odd-model {
                margin-left: 50px;
                max-width: 800px;
            }

            pb-drawer {
                top: 128px;
                background-color: #F0F0F0;
                overflow: scroll;
            }

            .tocDrawer {
                padding: 0 10px;
            }

            #toc ul {
                list-style-type: none;
                margin: 0;
                padding: 0;
            }

            #toc ul ul {
                margin-left: 28px;
            }

            #toc li {
                margin-bottom: .5em;
            }

            #toc li:first-child {
                margin-top: .5em;
            }

            #toc li > pb-link {
                margin-left: 28px;
                display: block;
            }

            #toc [slot=collapse-trigger] pb-link {
                margin-left: 0px;
                display: inline;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/*
    pb-common-styles contains all styling rules that are common to all components including it.


*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
;
