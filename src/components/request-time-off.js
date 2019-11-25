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
import { store } from '../store.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '/node_modules/mte-calendar/mte-calendar.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

class RequestTimeOff extends connect(store)(PageViewElement) {
  static get styles() {
    return [
      SharedStyles
    ];
  }

  render() {
    return html` 
      <link rel="stylesheet" href="${this.baseURI}/node_modules/bootstrap/dist/css/bootstrap.min.css">
      <link rel="stylesheet" href="${this.baseURI}/fonts/font-awesome-4.7.0/css/font-awesome.min.css">

      <section>
          <!--
          <iron-ajax
            auto
            url="this.request.url"
            params="this.request.params"
            handle-as="json"
            @response="_handleResponse"
          ></iron-ajax> -->
        <div class="container">
          <div class="row">
            <div class="col col-md">
              <div class="card mb-3 shadow p-3 mb-5 bg-white rounded" style="max-width: 540px;">
                <div class="card-body">
                  <h5 class="card-title">${this.employee.name}</h5>
                  <h6 id="employee-position">${this.employee.position}</h6>
                  <p class="card-text">According to our register your AVAILABLE days are:</p>
                  <div id="employee-actions">
                    <div class="btn-group" role="group">
                      <button id="pto-btn" type="button" class="btn btn-light border-0 ${this.employee.availableDays.pto.active? 'active' : ''}" @tap="${this._toggleSelection}">PTO <span id="badge-pto" class="badge badge-light badge-pill text-monospace">${this.employee.availableDays.pto.number}</span></button>
                      <button id="vacations-btn" type="button" class="btn btn-light border-0 ${this.employee.availableDays.vacations.active? 'active' : ''}" @tap="${this._toggleSelection}">Vacations <span id="badge-vacations" class="badge badge-light badge-pill text-monospace">${this.employee.availableDays.vacations.number}</span></button>
                    </div>
                    <button class="btn btn-primary" style="display: ${this.enable_submit? 'inline-flex' :  'none'}" @tap="${this._submit}">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col col-md">
              <mte-calendar style="max-width: 540px;" .evt_types="${this.events_def}" @before_date_attached="${this._beforeDateSelected}" @date_detached="${this._dateDeselected}"></mte-calendar>
            </div>
          </div>
        </div>
      </section>
    `;
  }
  
  static get properties() {
    return {
      calendar: { type: Object },
      events_def: { type: Object },
      employee: { type: Object },
      enable_submit: { type: Boolean },
      request: {type: Object }
    };
  }

  constructor() {
    // Always call super() first
    super();

    this.events_def = {
      PTO: {color: "#00CFB5", min_date: "today", max_date:"29-Aug-2020", restrictWeekdays: true, validation: this.validate_pto, indicators: false, scope: this},
      Vacations: {color: "#FFDD30", min_date: "today", max_date:"29-December-2020", restrictWeekdays: true, validation: this.validate_vacation, indicators: false, scope: this}
    };
    
    //output
    // this.server = {address: "https://vacations-253817.appspot.com", port: "", requests: { "time-off-req": "api/request", employee: "{employee_id}"} };
    // this.request = {type:"", url:"", params:""};
    // this.enable_submit = false;

    //input
    // this.employee = {
    //   id : "john.doe@nearshoretechnology.com"
    // };
  
    // fetch(this.get_url("employee"),
    // {
    //   method: 'get',
    //   headers: {
    //     "Content-Type": "application/json"
    //   }
    // })
    // .then(response => {
    //   return response.json();
    // })
    // .then(value => {
      //this.employee = value;
      // this.employee.image = "images/unknown.png",
      // this.employee.availableDays.pto.active = true;
      // this.employee.availableDays.vacations.active = false;
    // })
    // .catch(_ => console.log("Something went wrong"));
    
  }

  firstUpdated(changedProp) {
    super.firstUpdated(changedProp);
    this.calendar = this.shadowRoot.querySelector("mte-calendar");
  }

  _toggleSelection( event ) {
    let target = ( event.target.getAttribute("id").includes("-btn")? event.target : event.target.parentNode);
    //only if button has not been set to active yet, otherwise we do nothing
    if(!target.getAttribute("class").includes("active")) {
      if(target.getAttribute("id") == "pto-btn") {
        this.employee.availableDays.pto.active = true;
        this.employee.availableDays.vacations.active = false;
        this.calendar.cur_event = "PTO"
      }
      else
      {
        this.employee.availableDays.vacations.active = true;
        this.employee.availableDays.pto.active = false;
        this.calendar.cur_event = "Vacations"
      }
      this.requestUpdate();
    }
  }

  _beforeDateSelected(e) {
    let evt_added = e.detail.evt.toLowerCase();
    this.employee.availableDays[evt_added].number--;
    if(this.calendar.isEmpty())
      this.enable_submit = true;
    this.requestUpdate();
  }

  _dateDeselected(e) {
    let evt_added = e.detail.evt.toLowerCase();
    this.employee.availableDays[evt_added].number++;
    if(this.calendar.isEmpty())
      this.enable_submit = false;

    this.requestUpdate();
  }

  _submit(e) {
    //
    let _req_dates = this.calendar.getValues();
    let params = {EmployeeId: this.employee.id, Pto: _req_dates['PTO'], Vacations: _req_dates['Vacations']};
    let req_type = "time-off-req"
    fetch(this.get_url(req_type), {
      method: 'post',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      return response.text();
    })
    .then(value => {console.log(value);})
    .catch(_ => console.log("Something went wrong"));
  }

  get_url(req_type) {
    return this.server.address + ":" +this.server.port + "/" + this.server.requests[req_type].replace("{employee_id}", this.employee.id);
  }

  validate_pto(_time, evts_obj) {
    if(this.scope.employee.availableDays.pto.number <= 0)
      return false;

    //ptos cannot be consecutive. We add and substract a weekday to validate because weekends are not included
    // let cur_date = new Date(_time);
    // if(evts_obj.PTO.includes(cur_date.DateAdd("w", 1).getTime()) || evts_obj.PTO.includes(cur_date.DateAdd("w", -1).getTime()))
    //   return false;

    return true;
  }

  validate_vacation(_time, evts_obj) {
    if(this.scope.employee.availableDays.vacations.number <= 0)
      return false;
    
    return true;
  }

  stateChanged(state) {
    this.employee = state.app.loggedUsr;
    if(this.employee != null) {
      this.employee.availableDays = { pto: { number: 3, active: true }, vacations: { number: 10, active: false } };
    }
  }
  
}

window.customElements.define('request-time-off', RequestTimeOff);
