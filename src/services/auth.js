import { connect } from 'pwa-helpers/connect-mixin.js';
// This element is connected to the Redux store.
import { store } from '../store.js';
import { BaseService } from './base.js';
import { UserService } from './user.js';
import {
    setUser,
    updateAccordionState,
    navigate } from '../actions/app.js';

export class AuthService extends connect(store)(BaseService) {

    constructor(userService) {
        super();
        this.userService = userService;
    }

    static get error() { return this.error };

    validate( loginInfo ) {
        if(loginInfo.username == "")
        {
            throw new AuthError("username", "The Username is mandatory.");
            return;
        }
        let emailRegEx = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
        if(!emailRegEx.test(loginInfo.username)) {
            throw new AuthError("username", "The Username must be a valid email address.");
            return;
        }
        
        if(loginInfo.password == "")
        {
            throw new AuthError("password", "The Password is mandatory.");
            return;
        }
        if(loginInfo.password.length < 8) {
            throw new AuthError("password", "The password must be at least 8 characters long.");
            return;
        }
        
    }

    authenticate(loginInfo) {
        if(loginInfo.username != "aldo.matus@nearshoretechnology.com" || loginInfo.password != "12345678") {
            throw "Invalid Credentials";
        }
    }

    async login( loginInfo ) {
        let employee = {};
        
        try {
            this.validate(loginInfo);
        }
        catch(err) {
            throw err;
        };

        try {
            await this.authenticate(loginInfo);
            //retrieve employee data
            employee = await this.userService.getEmployee( loginInfo.username );
        }
        catch(err) {
            throw new AuthError("form", err);
            return;
        };

        store.dispatch(setUser(employee));
        store.dispatch(navigate(decodeURIComponent("/index.html")));
    }

    logout() {
        store.dispatch(setUser(null));
        store.dispatch(updateAccordionState(false));
        store.dispatch(navigate(decodeURIComponent("/")));
    }
}
export class AuthError {
    constructor(element, message) {
        this.element = element;
        this.message = message;
    }
}

export const userService = new UserService();
export const authService = new AuthService(userService);