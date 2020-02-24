/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {
  UPDATE_PAGE,
  UPDATE_OFFLINE,
  OPEN_SNACKBAR,
  CLOSE_SNACKBAR,
  UPDATE_DRAWER_STATE,
  UPDATE_ACCORDION_STATE,
  SET_USER,
  SET_ALERT,
  SET_BANNER
} from '../actions/app.js';

const INITIAL_STATE = {
  page: '',
  offline: false,
  drawerOpened: false,
  snackbarOpened: false,
  usrAccordionOpened: false,
  loggedUsr: null,
  alert: null,
  banner: null
};

const app = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_PAGE:
      return {
        ...state,
        page: action.page
      };
    case UPDATE_OFFLINE:
      return {
        ...state,
        offline: action.offline
      };
    case UPDATE_DRAWER_STATE:
      return {
        ...state,
        drawerOpened: action.opened
      };
    case OPEN_SNACKBAR:
      return {
        ...state,
        snackbarOpened: true
      };
    case CLOSE_SNACKBAR:
      return {
        ...state,
        snackbarOpened: false
      };
    case UPDATE_ACCORDION_STATE:
      return {
        ...state,
        usrAccordionOpened: action.opened
      };
      case SET_USER:
        return {
          ...state,
          loggedUsr: action.user
        };
      case SET_ALERT:
        return {
          ...state,
          alert: action.alert
        };
      case SET_BANNER:
        return {
          ...state,
          banner: action.banner
        };
    default:
      return state;
  }
};

export default app;
