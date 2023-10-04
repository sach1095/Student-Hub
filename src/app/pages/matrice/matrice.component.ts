import { Component } from '@angular/core';
import { User } from 'src/app/models/users';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { environment } from 'src/environments/environment.prod';

export interface userMatrice {
  id: String;
  url: String;
  img: String;
  host: String;
  login: String;
}

@Component({
  selector: 'app-matrice',
  templateUrl: './matrice.component.html',
  styleUrls: ['./matrice.component.scss'],
})
export class MatriceComponent {
  public user?: User | null;
  public usersMatrice?: userMatrice[] | null;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.fetchLoggedUser();
    await this.fetchStudent();
    console.log('usersMatrice');
    console.log(this.usersMatrice);
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

      this.usersMatrice = rep.data.map((user: any) => {
        return {
          id: user.id,
          login: user.login,
          url: user.url,
          img: user.img,
          host: user.host,
        };
      });
    } catch (error) {
      console.error('Failed to fetch students: ', error);
    }
  }
}
