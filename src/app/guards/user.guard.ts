import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/users';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  public user?: User | null;

  constructor(private router: Router, private userService: UserService) {}

  private async fetchLoggedUser() {
    this.user = await firstValueFrom(this.userService.getLoggedUser());
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const isInitCompleted = await firstValueFrom(this.userService.initCompleted$);
    if (!isInitCompleted) {
      return this.router.createUrlTree(['/login']);
    }

    await this.fetchLoggedUser();
    const isLoggedIn = this.user ? true : false;
    return isLoggedIn || this.router.createUrlTree(['/login']);
  }
}
