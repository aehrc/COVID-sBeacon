import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private appConfig: any;

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    return this.http.get('/assets/config.json')
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  // This is an example property ... you can make it however you want.
  get apiBaseUrl() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.apiBaseUrl;
  }
  get login() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.login;
  }
}
