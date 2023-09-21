import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Student-Hub';

  constructor(private router: Router, private userService: UserService, private appService: AppService) {}

  public get currentUrl(): string {
    return this.router.url;
  }

  ngOnInit(): void {
    try {
      this.userService.initUserDatas();
    } catch (e) {}
  }
}
