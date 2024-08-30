import { NgModule } from "@angular/core";
import { Routes, RouterModule, Router } from "@angular/router";
import { MainComponent } from "./components/main/main.component";
import { AboutComponent } from "./components/about/about.component";
import { LoginComponent } from "./components/login/login.component";
import { SearchComponent } from "./components/search/search.component";
import { StrepifunComponent } from "./components/strepifun/strepifun.component";
import { OktaCallbackComponent, OktaAuthGuard } from "@okta/okta-angular";

const routes: Routes = [
  {
    path: "",
    component: AboutComponent,
  },
  {
    path: "main",
    component: MainComponent,
    //canActivate: [OktaAuthGuard],
  },
  {
    path: "main/:input",
    component: MainComponent,
    //canActivate: [OktaAuthGuard],
  },
  {
    path: "search",
    component: SearchComponent,
  },
  {
    path: "search/:profile",
    component: SearchComponent,
  },
  {
    path: "query",
    component: MainComponent,
    //canActivate: [OktaAuthGuard],
  },
  {
    path: "query/:input",
    component: MainComponent,
    //canActivate: [OktaAuthGuard],
  },
  {
    path: "strepifun",
    component: StrepifunComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "implicit/callback",
    component: OktaCallbackComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
