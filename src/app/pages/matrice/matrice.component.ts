import { Component } from '@angular/core';
import { User } from 'src/app/models/users';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { environment } from 'src/environments/environment.prod';
import { Matrice, UserMatrice } from 'src/app/models/matrice';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-matrice',
  templateUrl: './matrice.component.html',
  styleUrls: ['./matrice.component.scss'],
})
export class MatriceComponent {
  public user?: User | null;
  public usersMatrice?: UserMatrice[] | null;
  public matrice?: Matrice;
  public selectedTabIndex: number = 0;

  constructor(private userService: UserService, private storageService: StorageService) {}

  async ngOnInit() {
    await this.fetchLoggedUser();
    let startTime = performance.now();
    await this.fetchStudent();

    this.selectedTabIndex = this.storageService.getMatriceIndex() || 0;
    if (this.usersMatrice) this.matrice = new Matrice(this.usersMatrice);
    else console.error('userMatrice error instanciated, please reload page');
    let endTime = performance.now();
    let timeDiff = endTime - startTime; // en millisecondes
    timeDiff /= 1000; // convertit en secondes
    console.log('Le code a mis ' + timeDiff + " secondes à s'exécuter.");
  }

  private async fetchLoggedUser() {
    this.user = await firstValueFrom(this.userService.getLoggedUser());
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
}
