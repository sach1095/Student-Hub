import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { IndexedDBService } from './services/indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private router: Router, private userService: UserService, private indexedDBService: IndexedDBService) {}

  public async logOut() {
    await this.userService.resetUser();
    localStorage.removeItem('usersIndex');
    localStorage.removeItem('usersIndex');
    this.indexedDBService.closeDatabase();
    this.router.navigate(['/login']);
  }
}
