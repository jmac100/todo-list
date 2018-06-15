import { Component, OnInit } from '@angular/core';

import { hideNavOverlay } from "../../mat";

import { AuthService, CacheService } from "../services";
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private cache: CacheService,
    private router: Router
  ) { }
  
  profile: any
  today = Date.now()
  page: string = ''

  ngOnInit() {
    this.profile = this.cache.getProfile()
    this.page = this.router.url
  }

  linkClicked() {
    //hideNavOverlay()
  }
}
