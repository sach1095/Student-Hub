import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public showError = false;
  public showSpinner = false;
  public messageError = '';
  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router, private storageService: StorageService) {}

  async ngOnInit() {
    let code = '';
    this.route.queryParams.subscribe((params: any) => (code = params.code));
    if (code) {
      this.showSpinner = true;
      this.getTokenData(code);
    }
  }

  public ProcessLogin() {
    this.OpenWindowOauth();
  }

  private OpenWindowOauth() {
    let redirUriPrefix = encodeURIComponent(`https://student-hub.fr/login`);
    let codeUriPrefix = encodeURIComponent('u-s4t2ud-45573df269eb8ad26466e16b8f407d8e5dc14447411f6f3307df1ae7faf6b2e9');
    var url = `https://api.intra.42.fr/oauth/authorize?client_id=${codeUriPrefix}&redirect_uri=${redirUriPrefix}&response_type=code&state=bsfdvjdshfdshfgsdkhgfisudghfiusdvfbuyvhuyfviufbvidusbviidsvb_for_42_student_app`;
    window.location.href = url;
  }

  // voir https://api.intra.42.fr/apidoc/guides/web_application_flow#exchange-your-code-for-an-access-token
  private async getTokenData(code: string) {
    const functions = getFunctions();
    const getData = httpsCallable(functions, 'getData');

    try {
      await getData({ code: code, client_id: environment.CLIENT_ID, client_secret: environment.CLIENT_SECRET }).then(async (rep: any) => {
        let userData = rep.data;

        if (userData.id) {
          console.log(`Success login to api.intra.42.fr`);
          await this.proccessLoginUser(userData);
          this.router.navigate(['/home']);
        } else throw new Error('user return from api is null or empty');
      });
    } catch (error) {
      console.log('Error fetch data user from api.intra.42.fr :', error);
      this.messageError = 'Error fetch data user from api.intra.42.fr';
      this.showError = true;
      this.showSpinner = false;
    }
  }

  private async proccessLoginUser(userData: any) {
    let user = null;
    user = await this.userService.setUserData(userData.id.toString());
    if (!user) {
      await this.userService.createUser(userData, userData.id.toString());
    }
  }
}
