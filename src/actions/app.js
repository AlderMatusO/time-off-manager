/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const UPDATE_ACCORDION_STATE = 'UPDATE_ACCORDION_STATE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const SET_USER = 'SET_USER';
export const SET_ALERT = 'SET_ALERT';
export const SET_BANNER = 'SET_BANNER';

export const navigate = (path) => (dispatch, getState) => {
  const state = getState();
  // Extract the page name from path.
  const page = state.app.loggedUsr === null? 'start-page' : (path === '/index.html' || path === '/' ? 'request-time-off' : path.slice(1));

  // Any other info you might want to extract from the path (like page type),
  // you can do here
  dispatch(loadPage(page));

  // Close the drawer - in case the *path* change came from a link in the drawer.
  dispatch(updateDrawerState(false));
};

const loadPage = (page) => (dispatch) => {
  switch(page) {
    case 'start-page':
      import('../components/start-page.js');
      break;
    case 'request-time-off':
      import('../components/request-time-off.js').then((module) => {
        // Put code in here that you want to run every time when
        // navigating to request-time-off after request-time-off.js is loaded.
      });
      break;
    case 'requests-history':
      import('../components/requests-history.js');
      break;
    default:
      page = 'view404';
      import('../components/my-view404.js');
  }

  dispatch(updatePage(page));
};

const updatePage = (page) => {
  return {
    type: UPDATE_PAGE,
    page
  };
};

let snackbarTimer;

export const showSnackbar = () => (dispatch) => {
  dispatch({
    type: OPEN_SNACKBAR
  });
  window.clearTimeout(snackbarTimer);
  snackbarTimer = window.setTimeout(() =>
    dispatch({ type: CLOSE_SNACKBAR }), 3000);
};

export const updateOffline = (offline) => (dispatch, getState) => {
  // Show the snackbar only if offline status changes.
  if (offline !== getState().app.offline) {
    dispatch(showSnackbar());
  }
  dispatch({
    type: UPDATE_OFFLINE,
    offline
  });
};

export const updateDrawerState = (opened) => {
  return {
    type: UPDATE_DRAWER_STATE,
    opened
  };
};

export const updateAccordionState = (opened) => {
  return {
    type: UPDATE_ACCORDION_STATE,
    opened
  };
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
  return {
    type: SET_USER,
    user
  };
};

export const setError = (alert) => {
  return {
    type: SET_ALERT,
    alert: {
      ...alert,
      type: 'error',
      confirm: 'OK'
    }
  };
};

export const setWarning = (alert) => {
  return {
    type: SET_ALERT,
    alert: {
      ...alert,
      type: 'warning',
    }
  };
};

export const setConfirm = (alert) => {
  return {
    type: SET_ALERT,
    alert: {
      ...alert,
      type: 'question',
      confirm: 'Yes',
      cancel: 'No',
    }
  };
};

export const setSuccess = (alert) => {
  return {
    type: SET_ALERT,
    alert: {
      ...alert,
      type: 'success',
      confirm: 'OK'
    }
  };
};

export const clearAlert = () => {
  return {
    type: SET_ALERT,
    alert: null
  };
};

export const setBanner = (message) => {
  return {
    type: SET_BANNER,
    banner: {
      message: message
    }
  }
};

export const clearBanner = (message) => {
  return {
    type: SET_BANNER,
    banner: null
  }
};

