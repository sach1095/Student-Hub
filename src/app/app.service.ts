import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private router: Router, private userService: UserService) {}

  public logOut() {
    this.userService.resetUser();
    this.router.navigate(['/login']);
  }
}
