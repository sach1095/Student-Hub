import { Component } from '@angular/core';
import { User } from 'src/app/models/users';
import { filter, firstValueFrom, tap } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { environment } from 'src/environments/environment.prod';
import { Matrice, UserMatrice } from 'src/app/models/matrice';
import { StorageService } from 'src/app/services/storage.service';
import { UserMatriceService } from 'src/app/services/matrice.service';
import { ParamMap } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ParamMapComponent } from './param-map/param-map.component';

@Component({
  selector: 'app-matrice',
  templateUrl: './matrice.component.html',
  styleUrls: ['./matrice.component.scss'],
})
export class MatriceComponent {
  public user?: User | null;
  public usersMatrice?: UserMatrice[] | null;
  public matrice?: Matrice;
  public showMatrice?: boolean = false;
  public selectedTabIndex: number = 0;
  public windowWidth: number = window.innerWidth;

  constructor(private userService: UserService, private storageService: StorageService, private userMatriceService: UserMatriceService, private readonly dialog: MatDialog) {}

  async ngOnInit() {
    await this.fetchLoggedUser();
    await this.fetchUsersMatrice();
    this.selectedTabIndex = this.storageService.getMatriceIndex() || 0;
    if (this.usersMatrice) this.matrice = new Matrice(this.usersMatrice);
    else console.error('userMatrice error instanciated, please reload page');
    this.showMatrice = true;
  }

  private async fetchLoggedUser() {
    this.user = await firstValueFrom(this.userService.getLoggedUser());
    if (this.user?.paramMap) {
      document.documentElement.style.setProperty('--dynamic-size-h1', `${this.user?.paramMap.size_h1}rem`);
      document.documentElement.style.setProperty('--dynamic-size-h1-mobile', `${this.user?.paramMap.size_h1_mobile}rem`);
      document.documentElement.style.setProperty('--dynamic-size-poste', `${this.user?.paramMap.size_poste}rem`);
      document.documentElement.style.setProperty('--dynamic-size-poste-mobile', `${this.user?.paramMap.size_poste_mobile}rem`);
      document.documentElement.style.setProperty('--dynamic-size-zone-h1', `${this.user?.paramMap.size_poste_mobile}rem`);
    }
  }

  async fetchUsersMatrice() {
    this.usersMatrice = await this.userMatriceService.getUsers();
  }

  private async fetchStudent() {
    const functions = getFunctions();

    try {
      const getStudentsConnected = httpsCallable(functions, 'getStudentsConnected');
      const rep: any = await getStudentsConnected({
        client_id: environment.CLIENT_ID,
        client_secret: environment.CLIENT_SECRET,
      });

      this.usersMatrice = rep.data;
    } catch (error) {
      console.error('Failed to fetch students: ', error);
    }
  }

  tabChanged(tabIndex: number): void {
    this.storageService.saveMatriceIndex(tabIndex);
  }

  public openParamMap() {
    const dialogRef = this.dialog.open(ParamMapComponent, {
      data: { paramMap: this.user!.paramMap },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(Boolean),
        tap(async ({ validate, paramReturn }) => {
          if (validate) {
            this.user!.paramMap = paramReturn;
            document.documentElement.style.setProperty('--dynamic-size-h1', `${paramReturn.size_h1}rem`);
            document.documentElement.style.setProperty('--dynamic-size-poste', `${paramReturn.size_poste}rem`);
            document.documentElement.style.setProperty('--dynamic-size-h1-mobile', `${paramReturn.size_h1_mobile}rem`);
            document.documentElement.style.setProperty('--dynamic-size-poste-mobile', `${paramReturn.size_poste_mobile}rem`);
            this.userService.updateUser();
          }
        })
      )
      .subscribe();
  }
}
