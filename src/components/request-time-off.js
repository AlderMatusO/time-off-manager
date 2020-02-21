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
import { formatDateArr } from '../helpers/date-arrays.js';
import { UserService } from '../services/user.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '/node_modules/mte-calendar/mte-calendar.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';
import { setConfirm, setSuccess, setError } from '../actions/app.js';

class RequestTimeOff extends connect(store)(PageViewElement) {
  static get styles() {
    return [
      SharedStyles
    ];
  }

  render() {
    return html` 
      <link rel="stylesheet" href="${this.baseURI}/node_modules/bootstrap/dist/css/bootstrap.min.css">
      <link rel="stylesheet" href="${this.baseURI}/fonts/font-awesome-4.7.0/css/all.min.css">

      <section>
        <div class="container">
          <div class="row">
            <div class="col col-md">
              <div class="card mb-3 shadow p-3 mb-5 bg-white rounded" style="max-width: 540px;">
                <div class="card-body">
                  <h5 class="card-title">${this.employee.name}</h5>
                  <h6 id="employee-position">${this.employee.position}</h6>
                  <p class="card-text">According to our register your AVAILABLE days are:</p>
                  <h6>
                    <a href="#" @click="${ this._toggleDetails }">Vacations details
                      ${ this.showDetails? html `<span class="fa fa-chevron-up"></span>` : html `<span class="fa fa-chevron-down"></span>` }
                    </a>
                  </h6>
                  <iron-collapse>
                    <div id="available-vacations" class="collapse-content">
                      <table style="width:50%;" class="table table-sm table-borderless non-selectable">
                        <thead>
                          <tr class="text-center">
                            <th scope="col">Days</th>
                            <th scope="col">Expire on</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          ${ this.employee.availableDays.vacations.exp_dates.map( (exp, index) => html `
                            <tr class="text-center"
                            style="color:${ !exp.isExpired() && exp.isAboutToExpire()? 
                            "red" : "black"}">
                              <th scope="row">${ exp.days }</th>
                              <td>${ exp.expirationDate!=null? formatDateArr([exp.expirationDate]) : "--" }</td>
                              <td>${ exp.isExpired()? 
                                html `<span style="color: black;" class="fas fa-skull-crossbones">` : (
                                exp.isAboutToExpire()?
                                html `<span style="color: red;" class="fas fa-bomb">` : html `` ) }</td>
                            </tr>
                          `)
                          }
                        </tbody>
                      </table>
                    </div>
                  </iron-collapse>
                  <br />
                  <div id="employee-actions">
                    <div class="btn-group" role="group">
                      <button id="pto-btn" type="button" class="btn btn-light border-0 ${this.employee.availableDays.pto.active? 'active' : ''}" @tap="${this._toggleSelection}">PTO <span id="badge-pto" class="badge badge-light badge-pill text-monospace">${this.employee.availableDays.pto.number}</span></button>
                      <button id="vacations-btn" type="button" class="btn btn-light border-0 ${this.employee.availableDays.vacations.active? 'active' : ''}" @tap="${this._toggleSelection}">Vacations <span id="badge-vacations" class="badge badge-light badge-pill text-monospace">${this.employee.availableDays.vacations.number}</span></button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="float-right">
                <button class="btn btn-secondary mb-3" style="display: ${this.enable_submit? 'inline-flex' :  'none'}" @tap="${this._clearAll}">
                  Clear all
                </button>
                <button class="btn btn-primary mb-3" style="display: ${this.enable_submit? 'inline-flex' :  'none'}" @tap="${this._submit}">
                  Submit
                </button>
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
      employee: { type: Object, reflect: true },
      enable_submit: { type: Boolean },
      apiURI: {type: String },
      showDetails: { type: Boolean },
      userService: { type: UserService }
    };
  }

  constructor() {
    // Always call super() first
    super();

    this.events_def = {
      PTO: {color: "#00CFB5", min_date: "today", max_date:"29-Aug-2023", restrictWeekdays: true, validation: this.validate_pto.bind(this), indicators: false},
      Vacations: {color: "#FFDD30", min_date: "today", max_date:"29-December-2023", restrictWeekdays: true, validation: this.validate_vacation.bind(this), indicators: false}
    };
    
    this.enable_submit = false;
    this.showDetails = false;
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

    if(evt_added === "vacations"){
      let selectedCycle = 
      this.employee.availableDays.vacations.findFirstCycle((item)=> item.days > 0); 

      selectedCycle.days--;
    }

    this.requestUpdate();
  }

  _dateDeselected(e) {
    let evt_added = e.detail.evt.toLowerCase();
    this.employee.availableDays[evt_added].number++;
    if(this.calendar.isEmpty())
      this.enable_submit = false;

    if(evt_added === "vacations"){
      let selectedCycle = 
      this.employee.availableDays.vacations.findLastCycle((item)=> item.days < item.par_days); 
      selectedCycle.days++;
    }

    this.requestUpdate();
  }

  

  _clearAll(e) {
    this.calendar.clearAll();
  }

  _submit(e) {
    //
    let _req_dates = this.calendar.getValues();
    let message = 'Are you sure you want to request the following dates?:<br/><div style="font-size:15px; font-weight:bold;">';
    if(_req_dates['PTO'].length > 0){
      message += '<p> - PTO: [' + formatDateArr(_req_dates['PTO']) + ']</p>';
    }
    if(_req_dates['Vacations'].length > 0){
      message += '<p> -  Vacations: [' + formatDateArr(_req_dates['Vacations']) + ']</p>';
    }

    message += '</div>';
    store.dispatch(setConfirm({
      title: 'New Request',
      message: message,
      preConfirm: async () => {
        let successMsg = "";
        try {
          successMsg = await this.userService.requestTimeOff(this.employee.id, _req_dates);
        }
        catch(error) {
          store.dispatch(setError({
            title: 'Something went wrong!',
            message: error
          }));
          return;
        }
        
        store.dispatch(setSuccess({
          title: 'Request successfully submitted',
          message: successMsg
        }));
      }
    }));
  }

  validate_pto(_time, evts_obj) {
    if(this.employee.availableDays.pto.number <= 0)
      return false;

    //PTO's cannot be consecutive to vacations and other PTO's. We add and substract a day to validate
    let cur_date = new Date(_time);
    if(evts_obj.PTO.includes(cur_date.DateAdd("d", 1).getTime()) ||
      evts_obj.PTO.includes(cur_date.DateAdd("d", -1).getTime()) ||
      evts_obj.Vacations.includes(cur_date.DateAdd("d", 1).getTime()) ||
      evts_obj.Vacations.includes(cur_date.DateAdd("d", -1).getTime()))
      return false;

    return true;
  }

  validate_vacation(_time, evts_obj) {
    if(this.employee.availableDays.vacations.number <= 0)
      return false;

    //vacations cannot be consecutive to PTO's
    let cur_date = new Date(_time);
    if(evts_obj.PTO.includes(cur_date.DateAdd("d", 1).getTime()) ||
      evts_obj.PTO.includes(cur_date.DateAdd("d", -1).getTime()))
      return false;
    return true;
  }

  stateChanged(state) {
    if(JSON.stringify(this.employee) !== JSON.stringify(state.app.loggedUsr)) {
      this.employee = state.app.loggedUsr;
    }
  }

  _toggleDetails(evt) {
    let accordion = this.shadowRoot.querySelector("iron-collapse");
    if(accordion != null){
      accordion.toggle();
      this.showDetails = !this.showDetails;
    }
  }
  
}

window.customElements.define('request-time-off', RequestTimeOff);

