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
import { formatDateArr } from '../helpers/date-arrays.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';
import { UserService } from '../services/user.js';

class RequestsHistory extends connect(store)(PageViewElement) {
  static get properties() {
    return {
      // This is the data from the store.
      requests: { type: Array },
      apiURI: { type: String },
      user: { type: Object },
      events_def: { type: Object },
      req_selected: { type: Number },
      calendar: { type: Object },
      userService: { type: UserService }
    };
  }

  static get styles() {
    return [
      SharedStyles
    ];
  }

  constructor() {
    super();
    this.requests = {list: []};
    this.events_def = {
      PTO: {color: "#00CFB5", min_date: "today", max_date:"31-December-9999", restrictWeekdays: true, validation: null, indicators: true, scope: this},
      Vacations: {color: "#FFDD30", min_date: "today", max_date:"31-December-9999", restrictWeekdays: true, validation: null, indicators: true, scope: this}
    };
  }

  firstUpdated() {
    this.calendar = this.shadowRoot.querySelector("mte-calendar");
    this.req_selected = 0;
    this.tryLoad();
  }

  render() {
    return html`
      <link rel="stylesheet" href="${this.baseURI}/node_modules/bootstrap/dist/css/bootstrap.min.css">
      <link rel="stylesheet" href="${this.baseURI}/fonts/font-awesome-4.7.0/css/all.min.css">

      <section>
        <h3>Requests List</h3>
        <div class="container">
          <div class="row">
            <div class="col col-md">
              <table class="table table-borderless table-hover non-selectable">
                <thead>
                  <tr>
                    <th scope="col">Status</th>
                    <th scope="col">Vacation Dates</th>
                    <th scope="col">PTO Dates</th>
                  </tr>
                </thead>
                <tbody>
                  ${ this.requests.list.map((request, index) => html `
                    <tr class="${ this.req_selected === index? "bg-info text-white" : "" }"
                      @tap="${ this._select }" id="${index}">
                      <th scope="row" class="cell">${request.status}</td>
                      <td class="cell">${request.vacationDates != null && request.vacationDates.length > 0? formatDateArr(request.vacationDates): "--"}</td>
                      <td class="cell">${request.ptoDates != null && request.ptoDates.length > 0? formatDateArr(request.ptoDates) : "--"}</td>
                    </tr>`
                  )}
                </tbody>
              </table>
            </div>
            <div class="col col-md">
              <mte-calendar _readonly="true" style="max-width: 540px; display:${this.req_selected >= 0? "block" : "none"};" .evt_types="${this.events_def}"></mte-calendar>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async tryLoad()
  {
    if(this.user != null){
      try{
        this.requests = await this.userService.getRequestsHistory(this.user.id);
        this.loadDatesOnCalendar(this.req_selected);
      }
      catch(err) {
        console.log("something went wrong: " + err);
      }
    }
  }

  stateChanged(state) {
    this.user = state.app.loggedUsr;
    if(this.userService)
      this.tryLoad();
  }

  _select( evt ) {
    let el = evt.target.getAttribute("class") === "cell"? evt.target.parentNode : evt.target;
    this.req_selected = parseInt(el.getAttribute("id"));
    this.loadDatesOnCalendar(this.req_selected);
  }

  loadDatesOnCalendar(index) {
    if(this.requests.list.length == 0) return;

    this.calendar.evt_types.PTO.dates = this.requests.list[index].ptoDates;
    this.calendar.evt_types.Vacations.dates = this.requests.list[index].vacationDates;
  }

}

window.customElements.define('requests-history', RequestsHistory);