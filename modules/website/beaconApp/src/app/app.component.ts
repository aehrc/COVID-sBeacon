import { Component } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { AppConfigService } from './app.config.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'beaconApp';
  isAuthenticated: boolean;
  login: boolean;

  constructor(public oktaAuth: OktaAuthService, private appConfigService: AppConfigService, private router: Router) {
     this.oktaAuth.$authenticationState.subscribe(
       (isAuthenticated: boolean)  => this.isAuthenticated = isAuthenticated
     );
   }

   ngOnInit() {
     this.login = this.appConfigService.login;
     if(this.login == true){
       this.router.navigate(['/login']);
     }
      this.oktaAuth.isAuthenticated().then((auth) => {
        this.isAuthenticated = auth;
      });
    }
    logout() {
    this.oktaAuth.logout('/');
  }

}
