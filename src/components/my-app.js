/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html, css } from 'lit-element';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import { installRouter } from 'pwa-helpers/router.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';
import '@polymer/iron-dropdown/iron-dropdown.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import {
  navigate,
  updateOffline,
  updateDrawerState,
  checkForUser,
  setUser
} from '../actions/app.js';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import { menuIcon } from './my-icons.js';
import './snack-bar.js';

class MyApp extends connect(store)(LitElement) {
  static get properties() {
    return {
      appTitle: { type: String },
      _page: { type: String },
      _drawerOpened: { type: Boolean },
      _snackbarOpened: { type: Boolean },
      _offline: { type: Boolean },
      _loggedUsr: { type: Object }
    };
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;

          --app-drawer-width: 256px;

          --app-primary-color: #4FC8ED;
          --app-secondary-color: #31BCAC;
          --app-header-color: #ECEBEB;
          --app-nst-skyblue: #4FC8ED;
          --app-nst-paleblue: #00CFB5;
          --app-dark-text-color: #8A8B8B;
          --app-light-text-color: white;
          --app-section-even-color: #f7f7f7;
          --app-section-odd-color: white;

          --app-header-background-color: var(--app-header-color);
          --app-header-text-color: var(--app-dark-text-color);
          --app-header-selected-color: var(--app-secondary-color);

          --app-drawer-background-color: var(--app-secondary-color);
          --app-drawer-text-color: var(--app-light-text-color);
          --app-drawer-selected-color: #78909C;
        }

        app-drawer {
          z-index: 2;
        }

        app-header {
          font-family: 'ITC Avant Garde Gothic';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          text-align: center;
          background-color: var(--app-header-background-color);
          color: var(--app-header-text-color);
          border-bottom: 1px solid #eee;
        }

        .toolbar-top {
          background-color: var(--app-header-background-color);
        }

        [main-title] {
          font-family: 'ITC Avant Garde Gothic LT';
          font-size: 10px;
          /* In the narrow layout, the toolbar is offset by the width of the
          drawer button, and the text looks not centered. Add a padding to
          match that button */
          padding-right: 44px;
        }

        .navbar-nav > .active a {
          color: var(--app-secondary-color) !important;
        }

        iron-dropdown > div.list-group {
          font-size: 14px;
          -webkit-user-select: none; /* Safari */        
          -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* IE10+/Edge */
          user-select: none; /* Standard */
        }

        .menu-btn {
          background: none;
          border: none;
          fill: var(--app-header-text-color);
          cursor: pointer;
          height: 44px;
          width: 44px;
        }

        .drawer-list {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          padding: 24px;
          background: var(--app-drawer-background-color);
          position: relative;
        }

        .drawer-list > a {
          display: block;
          text-decoration: none;
          color: var(--app-drawer-text-color);
          line-height: 40px;
          padding: 0 24px;
        }

        .drawer-list > a[selected] {
          color: var(--app-drawer-selected-color);
        }

        /* Workaround for IE11 displaying <main> as inline */
        main {
          display: block;
        }

        .main-content {
          padding-top: 64px;
          min-height: 100vh;
        }

        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }

        /* Wide layout: when the viewport width is bigger than 460px, layout
        changes to a wide layout */
        @media (min-width: 460px) {
          .toolbar-list {
            display: block;
          }

          .menu-btn {
            display: none;
          }

          .main-content {
            padding-top: 107px;
          }

          /* The drawer button isn't shown in the wide layout, so we don't
          need to offset the title */
          [main-title] {
            padding-right: 0px;
            font-size: 25px;
          }
        }
      `
    ];
  }

  render() {
    // Anything that's related to rendering should be done in here.
    return html`
    <!-- Load Bootstrap -->
    <link rel="stylesheet" href="./node_modules/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="fonts/font-awesome-4.7.0/css/font-awesome.min.css">
    
    ${this._loggedUsr != null? html `
      <!-- Header -->
      <app-header condenses reveals effects="waterfall">
        <!-- <app-toolbar class="toolbar-top">
          <button class="menu-btn" title="Menu" @click="${this._menuButtonClicked}">${menuIcon}</button>
          
        </app-toolbar> -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light row justify-content-between">
          <embed src="/images/manifest/NSTLogo.svg" width="130" class="col-2"/>
          <div class="col-3" main-title>${this.appTitle}</div>
          <div class="collapse navbar-collapse col-5">
            <ul class="navbar-nav text-uppercase font-weight-bold">
              <li class="nav-item ${this._page === 'request-time-off'? 'active' : ''}" >
                <a class="nav-link" href="/request-time-off">Request</a>
              </li>
              <li class="nav-item ${this._page === 'requests-history'? 'active' : ''}" >
                <a class="nav-link" href="/requests-history">Request History</a>
              </li>
              <li class="nav-item">
                <!-- <div class="dropdown">
                  <button class="btn btn-light btn-sm dropdown-toggle" type="button" id="user_actions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img src="${this._loggedUsr.image}" width="25"> ${this._loggedUsr.name}
                  </button>
                  <div class="dropdown-menu" aria-labelledby="user_actions">
                    <a class="dropdown-item">Action</a>
                    <a class="dropdown-item">Another action</a>
                    <a class="dropdown-item"><span class="fa fa-sign-out fa-sm">Log Out</a>
                  </div>
                </div> -->
                <button class="btn btn-light btn-sm dropdown-toggle" type="button" id="user_actions" @click="${this._openDropdown}">
                  <img src="${this._loggedUsr.image}" width="25"> ${this._loggedUsr.name}
                </button>
                <iron-dropdown id="dropdown" class="text-capitalize" no-overlap>
                  <div slot="dropdown-content" class="list-group text-left">
                    <a class="list-group-item list-group-item-action"><span class="fa fa-user-circle"></span> Account</a>
                    <a class="list-group-item list-group-item-action"><span class="fa fa-envelope"></span> Notification</a>
                    <a class="list-group-item list-group-item-action" @click="${this._logOut}"><span class="fa fa-sign-out"></span> Log Out</a>
                  </div>
                </iron-dropdown>
              </li>
            </ul>
          </div>
        </nav>
        
        <!-- This gets hidden on a small screen-->
        <!--<nav class="toolbar-list text-uppercase">
          <a ?selected="${this._page === 'request-time-off'}" href="/request-time-off">Request</a>
          <a ?selected="${this._page === 'requests-history'}" href="/requests-history">Requests History</a>
        </nav>-->
      </app-header>

      <!-- Drawer content -->
      <app-drawer
          .opened="${this._drawerOpened}"
          @opened-changed="${this._drawerOpenedChanged}">
        <nav class="drawer-list">
          <a ?selected="${this._page === 'request-time-off'}" href="/request-time-off">Request</a>
          <a ?selected="${this._page === 'requests-history'}" href="/requests-history">Requests History</a>
        </nav>
      </app-drawer>
      ` : html ``}

      <!-- Main content -->
      <main role="main" class="main-content">
        <start-page class="page" ?active="${this._page === 'start-page'}"></start-page>
        <request-time-off class="page" ?active="${this._page === 'request-time-off'}"></request-time-off>
        <requests-history class="page" ?active="${this._page === 'requests-history'}"></requests-history>
        <my-view404 class="page" ?active="${this._page === 'view404'}"></my-view404>
      </main>

      <snack-bar ?active="${this._snackbarOpened}">
        You are now ${this._offline ? 'offline' : 'online'}.
      </snack-bar>
    `;
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    setPassiveTouchGestures(true);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    store.dispatch(checkForUser);
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 460px)`,
        () => store.dispatch(updateDrawerState(false)));
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      const pageTitle = 'Abscence Control - ' + this._page;
      updateMetadata({
        title: pageTitle,
        description: pageTitle
        // This object also takes an image property, that points to an img src.
      });
    }
  }
  _openDropdown() {
    let dropdown = this.shadowRoot.querySelector("iron-dropdown");
    if(dropdown != null)
      dropdown.open();
  }

  _logOut() {
    store.dispatch(setUser(null));
    store.dispatch(navigate(decodeURIComponent("/")));
  }

  _menuButtonClicked() {
    store.dispatch(updateDrawerState(true));
  }

  _drawerOpenedChanged(e) {
    store.dispatch(updateDrawerState(e.target.opened));
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._snackbarOpened = state.app.snackbarOpened;
    this._drawerOpened = state.app.drawerOpened;
    this._loggedUsr = state.app.loggedUsr;
  }
}

window.customElements.define('my-app', MyApp);
