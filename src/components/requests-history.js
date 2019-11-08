/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from 'lit-element';
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import { increment, decrement } from '../actions/counter.js';


// These are the elements needed by this element.
import './counter-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

class RequestsHistory extends connect(store)(PageViewElement) {
  static get properties() {
    return {
      // This is the data from the store.
      requests: { type: Array },
      numero: { type: Number },
    };
  }

  static get styles() {
    return [
      SharedStyles
    ];
  }

  constructor() {
    super();
    this.numero = 2;
    this.requests = {list: []};
    // fetch("https://vacations-253817.appspot.com/api/request/john.doe@nearshoretechnology.com")
    // .then(response => { return response.json(); })
    // .then(data => { this.requests = data;})
    // .catch(err => console.log(err));
  }

  render() {
    return html`
      <section>
        <h1>Requests List</h1>
        <table>
          <tr>
            <th>Status</th>
            <th>Vacation Dates</th>
            <th>PTO Dates</th>
          </tr>
          ${ this.requests.list.map((request) => html `
            <tr>
              <td>${request.status}</td>
              <td>${request.vacationDates!=null? request.vacationDates.join(',') : "none"}</td>
              <td>${request.ptoDates!=null? request.ptoDates.join(',') : "none"}</td>
            </tr>`
          )}
        </table>
      </section>
    `;
  }

}

window.customElements.define('requests-history', RequestsHistory);
