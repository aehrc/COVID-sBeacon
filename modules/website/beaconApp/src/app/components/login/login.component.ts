import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart} from '@angular/router';

import { OktaAuthStateService } from '@okta/okta-angular';
import * as OktaSignIn from '@okta/okta-signin-widget';
import { AppConfigService } from '../../app.config.service';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login',
  template:`<div><button (click)="onInitiateLogin()">Login</button><div id="okta-signin-container"></div></div>`,
  styles: []
})
export class LoginComponent implements OnInit {
  widget = new OktaSignIn({
    baseUrl: 'https://dev-8520796.okta.com'
  });

  constructor(private oktaAuth: OktaAuth, private oktaAuthService: OktaAuthStateService, router: Router, private appConfigService: AppConfigService) {
    // Show the widget when prompted, otherwise remove it from the DOM.
      router.events.forEach(event => {
        if (event instanceof NavigationStart) {
          switch(event.url) {
            case '/login':
            case '/main':
              break;
            default:
              this.widget.remove();
              break;
          }
        }
      });

  }

  async onInitiateLogin() {
    await this.oktaAuth.signInWithRedirect({ originalUri: '/' });
  }

  ngOnInit() {
    this.widget.renderEl({
      el: '#okta-signin-container'},
      (res) => {
        if (res.status === 'SUCCESS') {
          //this.oktaAuth.loginRedirect('/', { sessionToken: res.session.token });
          // Hide the widget
          this.widget.hide();
        }
      },
      (err) => {
        throw err;
      }
    );
  }
}
