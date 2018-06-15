import { Component, OnInit } from '@angular/core';
import { AuthService } from "../services";

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  constructor(public auth: AuthService) {
    
  }

  ngOnInit() {
    this.auth.handleAuthentication();
  }
  

}
