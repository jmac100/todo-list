import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { ApolloModule, Apollo } from "apollo-angular";
import { HttpLinkModule, HttpLink } from "apollo-angular-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { NgxPageScrollModule } from "ngx-page-scroll";

import { environment } from "../environments/environment";

// services
import { AuthService, AuthGuardService, CacheService } from "./services";

// 3rd party
import { SortablejsModule } from "angular-sortablejs";

// components
import { AppComponent } from './app.component';
import { CallbackComponent } from './callback/callback.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { ProjectsComponent } from './projects/projects.component';

@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
    NavbarComponent,
    HomeComponent,
    DashboardComponent,
    SpinnerComponent,
    ProjectsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    NgxPageScrollModule,
    SortablejsModule.forRoot({
      animation: 200,
      handle: ".my-handle",
      scrollSensitivity: 50
    }),
    RouterModule.forRoot([
      { path: 'callback', component: CallbackComponent },
      { path: 'todos', component: DashboardComponent, canActivate: [AuthGuardService] },
      { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuardService] },
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ])
  ],
  providers: [
    AuthService,
    AuthGuardService,
    CacheService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(apollo: Apollo, httpLink: HttpLink) {
    apollo.create({
      link: httpLink.create({ uri: environment.api_url }),
      cache: new InMemoryCache()
    });
  }
}
