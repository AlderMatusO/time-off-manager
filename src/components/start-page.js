import { html } from 'lit-element';
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
// This element is connected to the Redux store.
import { store } from '../store.js';
import { AuthService, AuthError } from '../services/auth.js';

import { SharedStyles } from './shared-styles.js';

// These are the actions needed by this element.
/*import {
  
} from '../actions/login.js';*/

class StartPage extends connect(store)(PageViewElement) {
    
    constructor() {
        super();
        this.username = "";
        this.password = "";
        this.error = {
            element: "",
            message: ""
        };
    }

    static get properties() {
        return {
            username : { type: String },
            password : { type: String },
            error: { type: Object },
            authService: { type: AuthService }
        };
    }

    static get styles() {
        return [
            SharedStyles
        ];
    }

    render() {
        return html`
            <!-- Load Bootstrap -->
            <link rel="stylesheet" href="${this.baseURI}/node_modules/bootstrap/dist/css/bootstrap.min.css">
            <link rel="stylesheet" href="${this.baseURI}/fonts/font-awesome-4.7.0/css/all.min.css">

            <section>
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-md-4 offset-md-4">
                            <div class="text-center">
                                <img src="images/manifest/icon-72x72.png" class="img-fluid">
                                <h1 class="font-weight-bolder">Absence Control</h1>
                                <h3>Login</h3>
                            </div>
                            <form>
                                <div class="alert alert-danger" role="alert" ?hidden="${this.error.message === ""}">
                                    <span class="fa fa-exclamation-circle"></span> ${this.error.message}
                                </div>
                                <div class="form-group">
                                    <label for="username">Username</label>
                                    <input type="email" class="form-control ${["username","form"].includes(this.error.element) ? "is-invalid" : ""}" id="username" .value="${this.username}" placeholder="username@nearshoretechnology.com" @change="${(e)=>{this.username = e.target.value;}}">
                                </div>
                                <div class="form-group">
                                    <label for="password">Password</label>
                                    <input type="password" class="form-control ${["password","form"].includes(this.error.element) ? "is-invalid" : ""}" id="password" .value="${this.password}" placeholder="*********" @change="${(e)=>{this.password = e.target.value;}}">
                                    <small id="passwordHelp" class="form-text text-muted">Did you <a href="/">forget your password?</a></small>
                                    <a href="/"><small id="signInHelp" class="form-text text-muted">Sign in</small></a>
                                </div>
                                <button type="button" class="btn btn-primary btn-block text-uppercase" @click="${this._submit}">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
    async _submit(e) {
        this.error = {element: "", message: ""};
        
        //login the user
        try {
            await this.authService.login( { username: this.username, password: this.password } );
        } catch(err) {
            this.error = err;
            this.requestUpdate();
        }
    }
}

window.customElements.define('start-page', StartPage);