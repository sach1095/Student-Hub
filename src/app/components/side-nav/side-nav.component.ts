import { ViewportRuler } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { User } from 'src/app/models/users';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
  public user: User | null = null;
  public isMenuOpen: boolean = false;
  constructor(private router: Router, private userService: UserService, private appService: AppService, private viewportRuler: ViewportRuler) {}

  async ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(async () => {
      this.isMenuOpen = false;
    });
    await this.getLoggedUser();
  }

  private async getLoggedUser() {
    this.userService
      .getLoggedUser()
      .pipe(tap((user) => (this.user = user)))
      .subscribe();
  }

  public isDesktop() {
    return this.viewportRuler.getViewportSize().width >= 431;
  }

  public onSidenavClick(): void {
    this.isMenuOpen = false;
  }

  public logout() {
    this.appService.logOut();
  }
}
