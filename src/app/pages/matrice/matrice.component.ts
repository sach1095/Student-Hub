import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { User } from 'src/app/models/users';
import { filter, firstValueFrom, tap } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { Matrice, UserMatrice } from 'src/app/models/matrice';
import { StorageService } from 'src/app/services/storage.service';
import { UserMatriceService } from 'src/app/services/matrice.service';
import { MatDialog } from '@angular/material/dialog';
import { ParamMapComponent } from './param-map/param-map.component';
import { ViewChildren, QueryList, ElementRef } from '@angular/core';

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
  @ViewChildren('posteRef') postes!: QueryList<ElementRef>;

  constructor(private userService: UserService, private storageService: StorageService, private userMatriceService: UserMatriceService, private readonly dialog: MatDialog) {}

  async ngOnInit() {
    await this.fetchLoggedUser();
    await this.fetchUsersMatrice();
    this.selectedTabIndex = this.storageService.getMatriceIndex() || 0;
    if (this.usersMatrice) this.matrice = new Matrice(this.usersMatrice);
    else console.error('userMatrice error instanciated, please reload page');
    this.showMatrice = true;
    this.postes.changes.subscribe();
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

  public search(): void {
    if (!this.searchTerm.trim()) {
      // Si le terme de recherche n'est pas valide, retourner tous les utilisateurs
      this.filteredUsers = this.usersMatrice;
    } else {
      // Sinon, filtrer le dataset
      // if (this.usersMatrice && this.usersMatrice?.length > 0)
      this.filteredUsers = this.usersMatrice!.filter((user) => user.login.toLowerCase().includes(this.searchTerm.toLowerCase()));
      console.log('this.filteredUsers');
      console.log(this.filteredUsers);
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
    console.log('showUserSeletedOnClick');
    console.log(user);
    this.scrollToPoste(user.login.toString());
  }
  showUserSeleted() {
    console.log('showUserSeleted');
    console.log(this.filteredUsers);
    if (this.filteredUsers) this.scrollToPoste(this.filteredUsers[0].login.toString());
  }

  scrollToPoste(login: string): void {
    console.log('scrollToPoste');
    console.log(login);
    console.log('this.postes elemet');
    console.log(this.postes);
    const posteElement = this.postes.find((poste) => poste.nativeElement.id === login)?.nativeElement;
    console.log('scrollToPoste elemet');
    console.log(posteElement);
    if (posteElement) {
      posteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Ajoutez une classe pour mettre en surbrillance le poste (par exemple avec une bordure jaune)
      posteElement.classList.add('highlighted');
    }
  }
}
