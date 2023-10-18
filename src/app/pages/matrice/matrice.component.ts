import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users';
import { filter, firstValueFrom, tap } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { Matrice, UserMatrice } from 'src/app/models/matrice';
import { StorageService } from 'src/app/services/storage.service';
import { UserMatriceService } from 'src/app/services/matrice.service';
import { MatDialog } from '@angular/material/dialog';
import { ParamMapComponent } from './param-map/param-map.component';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-matrice',
  templateUrl: './matrice.component.html',
  styleUrls: ['./matrice.component.scss'],
})
export class MatriceComponent implements OnInit {
  public user?: User | null;
  public usersMatrice?: UserMatrice[] | null;
  public matrice?: Matrice;
  public showMatrice?: boolean = false;
  public selectedTabIndex: number = 0;
  public windowWidth: number = window.innerWidth;
  public searchTerm: string = '';
  public filteredUsers: UserMatrice[] | null | undefined = [];
  public postes: ElementRef[] = [];
  public isLoading: boolean = false;

  constructor(private userService: UserService, private storageService: StorageService, private userMatriceService: UserMatriceService, private readonly dialog: MatDialog) {}

  async ngOnInit() {
    await this.fetchLoggedUser();
    await this.fetchMatrice();
    this.selectedTabIndex = this.storageService.getMatriceIndex() || 0;
    this.showMatrice = true;
    this.userMatriceService.getPosteList().subscribe((postes) => {
      this.postes = postes;
    });
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

  async fetchMatrice() {
    this.matrice = await this.userMatriceService.getUsers();
  }

  public search(): void {
    if (!this.searchTerm.trim()) {
      // Si le terme de recherche n'est pas valide, retourner tous les utilisateurs
      this.filteredUsers = this.usersMatrice;
    } else {
      this.filteredUsers = this.usersMatrice!.filter((user) => user.login.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
  }

  public tabChanged(tabIndex: number): void {
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

  showUserSeletedOnClick(user: UserMatrice) {
    this.scrollToPoste(user);
  }

  showUserSeleted() {
    if (this.filteredUsers) this.scrollToPoste(this.filteredUsers[0]);
  }

  checkIfNeedChangeIndex(host: String) {
    const match = host.match(/z(\d+)r(\d+)p(\d+)/);
    const [, z, r, p] = match!.map(Number);
    if (z === 1 || z === 2) this.selectedTabIndex = 0;
    else this.selectedTabIndex = 1;
  }

  scrollToPoste(user: UserMatrice): void {
    this.isLoading = true;
    this.checkIfNeedChangeIndex(user.host);
    const posteElement = this.postes.find((poste) => poste.nativeElement.id === user.login)?.nativeElement;
    if (posteElement) {
      setTimeout(() => {
        this.isLoading = false;
        posteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1000);
      posteElement.classList.add('highlighted');
      setTimeout(() => {
        posteElement.classList.remove('highlighted');
      }, 5000);
    }
  }
}
