import { connect } from 'pwa-helpers/connect-mixin.js';
// This element is connected to the Redux store.
import { store } from '../store.js';
import { BaseService } from './base.js';
import { StringFormat } from '../helpers/string-format.js';
import { setUser } from '../actions/app.js';

export class UserService extends connect(store)(BaseService) {

    constructor() {
        super();
        this.serverErrorMessage = "There was an error while retrieving the data from the server.";
        this.timeOffUrl = process.env.APIBASEURI + "requests";
        this.employeeDataUrl = process.env.APIBASEURI + "employees/{0}";
        this.employeeHistoryUrl = process.env.APIBASEURI + "requests/{0}";
    }

    async getEmployee( username ) {
        let userData = await this.getUsersData( username );
        if(!userData)
            return false;

        let user = userData.employee;
        user.image = "images/unknown.png";
        user.availableDays = {
            'pto': {
                'par_days': userData.paidTimeOffDays,
                'number': userData.paidTimeOffDays,
                'active': true
            },
            'vacations': {
                'number': 0,
                'exp_dates': [
                    userData.lastYearVacationDays,
                    userData.currentYearVacationDays,
                    userData.nextYearVacationDays
                ]
            }
        };

        this.vacationsFactory(user.availableDays.vacations);
        store.dispatch(setUser(user));

        return user;
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
            item.days = item.available;
            item.par_days = item.available;
            item.isAboutToExpire = (function() {
                let today = new Date();
                return today.DateAdd("m", 2).getTime() > (new Date(this.expirationDate)).getTime();
            }).bind(item);
            item.isExpired = (function(){
                let today = new Date();
                return today.getTime() > (new Date(this.expirationDate)).getTime();
            }).bind(item);
            delete item.available;
        });

        
        rawVacations.number = rawVacations.exp_dates
        .filter((item) => !item.isExpired())
        .map((item) => item.par_days)
        .reduce((accum, item) => accum + item);
    
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