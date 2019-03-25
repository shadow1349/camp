import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit() {}

  Logout() {
    this.auth.Logout();
  }
}
