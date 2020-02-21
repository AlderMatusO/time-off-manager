import { connect } from 'pwa-helpers/connect-mixin.js';
// This element is connected to the Redux store.
import { store } from '../store.js';
import { BaseService } from './base.js';
import { StringFormat } from '../helpers/string-format.js';

export class UserService extends connect(store)(BaseService) {

    constructor() {
        super();
        this.serverErrorMessage = "There was an error while retrieving the data from the server.";
        this.loggedUsr = {};
        this.timeOffUrl = process.env.APIBASEURI + "requests";
        this.employeeDataUrl = process.env.APIBASEURI + "employees/{0}";
        this.employeeVacationDaysUrl = process.env.APIBASEURI + "employees/{0}/days";
        this.employeeHistoryUrl = process.env.APIBASEURI + "requests/{0}";
    }

    async getEmployee( username ) {
        let usr = await this.getUsersData( username );
        if(!usr)
            return false;
        
        let vacationsData = await this.getVacationsData( username );

        if(!vacationsData)
            return false;

        usr.image = "images/unknown.png";
        usr.availableDays.pto.active = true;
        usr.availableDays.vacations.active = false;
        usr.availableDays.vacations.exp_dates = vacationsData;
        this.vacationsFactory(usr.availableDays.vacations);

        return usr;
    }

    getUsersData( userId ) {
        return fetch(StringFormat(this.employeeDataUrl, userId),
        {
            method: 'get',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(res => { return res.json() })
        .catch(err => { throw this.serverErrorMessage;});
    }

    getVacationsData( employeeId ) {
        return fetch(StringFormat(this.employeeVacationDaysUrl, employeeId),
        {
            method: 'get',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json() )
        .then(data => data.vacations)
        .catch( err => { throw this.serverErrorMessage; } );
    }

    getRequestsHistory( employeeId ) {
        return fetch(StringFormat(this.employeeHistoryUrl, employeeId),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => { return response.json(); })
        .catch(err => { throw this.serverErrorMessage; });
    }

    requestTimeOff( employeeId, dates ) {
        let params = { EmployeeId: employeeId, Pto: dates['PTO'], Vacations: dates['Vacations'] };
        return fetch(this.timeOffUrl, {
          method: 'post',
          body: JSON.stringify(params),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          return response.text();
        })
        .catch(_err => { throw this.serverErrorMessage; });
    }

    vacationsFactory(rawVacations) {
        rawVacations.exp_dates.map((item) => {
            item.par_days = item.days;
            item.isAboutToExpire = (function() {
                let today = new Date();
                return today.DateAdd("m", 2).getTime() > (new Date(this.expirationDate)).getTime();
            }).bind(item);
            item.isExpired = (function(){
                let today = new Date();
                return today.getTime() > (new Date(this.expirationDate)).getTime();
            }).bind(item);
        });
    
        rawVacations.findFirstCycle = (function(condition){
            return this.find(this.exp_dates, condition);
        }).bind(rawVacations);

        rawVacations.findLastCycle = (function(condition){
            return this.find(this.exp_dates.slice().reverse(), condition);
        }).bind(rawVacations);

        rawVacations.find = function(cycles, condition) {
            return cycles.find(
                (item) => {
                return !item.isExpired() && condition(item);
            });
        };
    }

}