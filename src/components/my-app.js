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
import { clearAlert } from '../actions/app.js';
import { UserService } from '../services/user.js';
import { AuthService, authService, userService } from '../services/auth.js';
import '@polymer/iron-dropdown/iron-dropdown.js';
import '@polymer/iron-collapse/iron-collapse.js';


// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import {
  navigate,
  updateOffline,
  updateDrawerState,
  updateAccordionState,
  checkForUser,
} from '../actions/app.js';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import './snack-bar.js';

class MyApp extends connect(store)(LitElement) {
  static get properties() {
    return {
      appTitle: { type: String },
      _usrAccordionOpened: { type: Boolean },
      _page: { type: String },
      _drawerOpened: { type: Boolean },
      _snackbarOpened: { type: Boolean },
      _offline: { type: Boolean },
      _loggedUsr: { type: Object },
      _alert: { type: Object },
      authService: { type: AuthService },
      userService: { type: UserService },
    };
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;

          --app-drawer-width: 320px;

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

        .navbar {
          font-family: 'ITC Avant Garde Gothic';
          top: 0;
          left: 0;
          width: 100%;
          text-align: center;
          background-color: var(--app-header-background-color);
          color: var(--app-header-text-color);
          border-bottom: 1px solid #eee;
        }

        [main-title] {
          font-family: 'ITC Avant Garde Gothic LT';
          font-size: 20px;
          /* In the narrow layout, the toolbar is offset by the width of the
          drawer button, and the text looks not centered. Add a padding to
          match that button */
          display: block;
        }

        li.nav-item > a.nav-link, .dropdown-toggle {
          font-size: 10px;
        }

        .user_actions img {
          border-radius: 50%;
        }

        .navbar-nav > .active a {
          color: var(--app-secondary-color) !important;
        }

        .navbar-brand {
          display: none;
        }

        .navbar-toggler {
          margin-left: 20px;
        }

        .drawer-list > a.user_actions {
          font-size: 12px;
          color: white !important;
        }

        a, div.list-group-item {
          -webkit-user-select: none; /* Safari */        
          -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* IE10+/Edge */
          user-select: none; /* Standard */
        }

        a.list-group-item {
          font-size: 14px;
        }
        
        div.list-group-item {
          font-size: 13px;
        }

        div.collapse-content > div.list-group > div.list-group-item {
          background-color: var(--app-drawer-background-color);
          color: white;
          border: none;
        }

        div.collapse-content > div.list-group > div.list-group-item:last-child {
          border-bottom: 1px solid #eee;
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
          padding: 20px;
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
          padding-top: 35px;
          min-height: 80vh;
        }

        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }

        /* Wide layout: when the viewport width is bigger than 460px, layout
        changes to a wide layout */
        @media (min-width: 992px) {
          .navbar {
            display: flex;
          }

          li.nav-item > a.nav-link, .dropdown-toggle {
            font-size: 14px;
          }

          .menu-btn {
            display: none;
          }

          [main-title] {
            display: none;
          }
          
          .navbar-expand-lg .navbar-collapse {
              display: -ms-flexbox!important;
              display: flex!important;
              -ms-flex-preferred-size: auto;
              flex-basis: auto;
          }

          .navbar-brand {
            display: block;
          }

          .main-content {
            padding-top: 55px;
          }
        }
      `
    ];
  }

  render() {
    // Anything that's related to rendering should be done in here.
    return html`
    <!-- Load Bootstrap -->
    <link rel="stylesheet" href="${this.baseURI}/node_modules/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="${this.baseURI}/fonts/font-awesome-4.7.0/css/all.min.css">
    
    ${this._loggedUsr != null? html `
      <!-- Header -->
      <!--<app-header condenses reveals effects="waterfall">-->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <button class="navbar-toggler" title="Menu" @click="${this._menuButtonClicked}">
            <svg height="24" viewBox="0 0 24 24" width="24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
            </button>
            <div main-title class="align-middle mx-auto">${this.appTitle}</div>
            <embed src="images/manifest/NSTLogo.svg" width="190" class="navbar-brand"/>

          <!-- <div class="col-3" main-title>${this.appTitle}</div> -->
          <div class="collapse navbar-collapse justify-content-end">
            <ul class="navbar-nav text-uppercase font-weight-bold">
              <li class="nav-item ${this._page === 'request-time-off'? 'active' : ''}" >
                <a class="nav-link" href="/request-time-off">Request</a>
              </li>
              <li class="nav-item ${this._page === 'requests-history'? 'active' : ''}" >
                <a class="nav-link" href="/requests-history">Request History</a>
              </li>
              <li class="nav-item">
                <button class="btn btn-light btn-sm dropdown-toggle user_actions" type="button" @click="${this._openDropdown}">
                  <img src="${this._loggedUsr.image}" width="25"> ${this._loggedUsr.name}
                </button>
                <iron-dropdown id="dropdown" class="text-capitalize" no-overlap>
                  <div slot="dropdown-content" class="list-group text-left">
                    <a class="list-group-item list-group-item-action"><span class="fa fa-user-circle"></span> Account</a>
                    <a class="list-group-item list-group-item-action"><span class="fa fa-envelope"></span> Notification</a>
                    <a class="list-group-item list-group-item-action" @click="${this._logOut}"><span class="fa fa-sign-out"></span> Log Out</a>
                  </div>
                </iron-dropdown>
                </div>
              </li>
            </ul>
          </div>
        </nav>
        
        <!-- This gets hidden on a small screen-->
        <!--<nav class="toolbar-list text-uppercase">
          <a ?selected="${this._page === 'request-time-off'}" href="/request-time-off">Request</a>
          <a ?selected="${this._page === 'requests-history'}" href="/requests-history">Requests History</a>
        </nav>-->
      <!--</app-header>-->

      <!-- Drawer content -->
      <app-drawer
          .opened="${this._drawerOpened}"
          @opened-changed="${this._drawerOpenedChanged}">
        <nav class="drawer-list container">
          <a class="user_actions border-bottom" @click="${this._toggleAccordion}">
            <img src="${this._loggedUsr.image}" width="25">
            ${this._loggedUsr.name} ${this._usrAccordionOpened?
              html `<span class="fa fa-chevron-up"></span>` : html `<span class="fa fa-chevron-down"></span>`}
          </a>
          <iron-collapse>
            <div class="collapse-content">
              <div class="list-group list-group-flush">
                <div class="list-group-item"><span class="fa fa-user-circle"></span> Account</div>
                <div class="list-group-item"><span class="fa fa-envelope"></span> Notification</div>
                <div class="list-group-item" @click="${this._logOut}"><span class="fa fa-sign-out"></span> Log Out</div>
              </div>
            </div>
          </iron-collapse> 
          <a ?selected="${this._page === 'request-time-off'}" href="/request-time-off">Request</a>
          <a ?selected="${this._page === 'requests-history'}" href="/requests-history">Requests History</a>
        </nav>
      </app-drawer>
      ` : html ``}

      <!-- Main content -->
      <main role="main" class="main-content">
        <start-page class="page" ?active="${this._page === 'start-page'}" .authService="${this.authService}"></start-page>
        <request-time-off class="page" ?active="${this._page === 'request-time-off'}" .userService="${this.userService}"></request-time-off>
        <requests-history class="page" ?active="${this._page === 'requests-history'}" .userService="${this.userService}"></requests-history>
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
    this.authService = authService;
    this.userService = userService;
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

  _toggleAccordion() {
    let accordion = this.shadowRoot.querySelector("iron-collapse");
    if(accordion != null){
      accordion.toggle();
      store.dispatch(updateAccordionState(!this._usrAccordionOpened));
    }
    
  }

  _logOut() {
    this.authService.logout();
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
    this._usrAccordionOpened = state.app.usrAccordionOpened;
    this._loggedUsr = state.app.loggedUsr;

    if(JSON.stringify(state.app.alert) != JSON.stringify(this._alert)) {
      this._alert = state.app.alert;
      if(this._alert != null) {
        let alert = Swal.fire({
          title: this._alert.type !== error? this._alert.title : 'ERROR',
          html: this._alert.message,
          icon: this._alert.type,
          showCancelButton: (this._alert.hasOwnProperty('cancel')),
          confirmButtonText: this._alert.hasOwnProperty('confirm')? this._alert.confirm : "OK",
          cancelButtonText: this._alert.hasOwnProperty('cancel')? this._alert.cancel : '',
          preConfirm: this._alert.hasOwnProperty('preConfirm')? this._alert.preConfirm : null,
          onAfterClose: () => store.dispatch(clearAlert())
        });
        
        if(this._alert.hasOwnProperty('postAlert'))
          alert.then( this._alert.postAlert );
      }
    }
  }
}

window.customElements.define('my-app', MyApp);
