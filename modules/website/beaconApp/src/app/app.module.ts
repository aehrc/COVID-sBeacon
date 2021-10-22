import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppConfigService } from './app.config.service';
import { AboutComponent } from './components/about/about.component';
import { MainComponent } from './components/main/main.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import { LoginComponent } from './components/login/login.component';
import { JwPaginationModule } from 'jw-angular-pagination';
//import { JwPaginationComponent } from 'jw-angular-pagination';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MatIconModule} from '@angular/material/icon';
import { DownloadService } from './components/main/main.service';
import { SearchComponent } from './components/search/search.component';
import { environment } from './../environments/environment';
import {
  OKTA_CONFIG,
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
} from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

const loginHost = 'https://test.cilogon.org';
const oktaAuth = new OktaAuth({
  issuer: loginHost,
  authorizeUrl: `${loginHost}/authorize`,
  userinfoUrl: `${loginHost}/oauth2/userinfo`,
  tokenUrl: `${loginHost}/oauth2/token`,
  scopes: ['openid'],
  redirectUri: `http://localhost:4200/implicit/callback`,
  clientId: 'cilogon:/client_id/7fea5c62e47d77047093644969b57e5',
  // need to set these to null to make sure the okta client *doesn't* include them in its requests
  // (otherwise we trigger CORS issues)
  headers: {
    'Content-Type': null,
    'X-Okta-User-Agent-Extended': null,
  }
});


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    AboutComponent,
    LoginComponent,
//  JwPaginationComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    NgbModule,
    MatIconModule,
    JwPaginationModule,
    OktaAuthModule
  ],
  providers: [
    { provide: OKTA_CONFIG, useValue: { oktaAuth } },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        return () => {
          //Make sure to return a promise!
          return appConfigService.loadAppConfig();
        };
      }
    },
    DownloadService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
