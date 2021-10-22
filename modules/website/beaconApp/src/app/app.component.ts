import { Component } from '@angular/core';
import { OktaAuthStateService } from '@okta/okta-angular';
import { AppConfigService } from './app.config.service';
import { Router } from '@angular/router';
import {AuthState} from '@okta/okta-auth-js';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'beaconApp';
  isAuthenticated: boolean;
  login: boolean;

  constructor(public oktaAuth: OktaAuthStateService, private appConfigService: AppConfigService, private router: Router) {
     this.oktaAuth.authState$.subscribe(
       (value: AuthState)  => this.isAuthenticated = value.isAuthenticated
     );
   }

   ngOnInit() {
     this.login = this.appConfigService.login;
     //this.oktaAuth.isAuthenticated().then((auth) => {
     //  this.isAuthenticated = auth;
     //  if(this.login == true && this.isAuthenticated == false ){
     //    this.router.navigate(['/login']);
     //  }
     //});
    }
    logout() {
    //this.oktaAuth.logout('/');
  }

}
