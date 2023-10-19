import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { LogtimeUtils } from 'src/app/models/logtimeUtils';
import { DateUtils } from 'src/app/models/dateUtils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../../../../node_modules/keen-slider/keen-slider.min.css'],
})
export class HomeComponent implements OnInit {
  public user?: User | null;
  public messageError: string = '';
  public showButtonRefresh = false;
  public timeTotals: any;
  public timeByMonthKeys: string[] = [];
  public MyObject = Object;
  public lastSave: any;
  public lastCallTime: any;
  public storedApiCall: any;
  private today = new Date().toLocaleDateString();
  private tempTimeUpdates: any[] = [];
  private currentMonthBeingProcessed: string | null = null;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.fetchLoggedUser();

    this.initialiseStoredApiCall();
    await this.handleGetLogtime();
  }

  private initialiseStoredApiCall(): void {
    if (!this.user || !this.user.strucCall) return;

    const { date, numberCall, time, lastSaveTime, lastSaveMonth } = this.user.strucCall;
    this.storedApiCall = { date, numberCall, time, lastSaveTime, lastSaveMonth };

    this.timeTotals = this.storedApiCall.lastSaveTime;
    this.timeByMonthKeys = this.MyObject.keys(this.timeTotals);
  }

  private async handleGetLogtime(): Promise<void> {
    if (!this.user) return;

    if (this.user.strucCall.numberCall === 6 || this.user.strucCall.date !== this.today) {
      await this.processGetLogtime();
    } else {
      await this.updateTimeTotalsIfNeeded();
      this.checkIfCurrentMonthExsit();
      this.initialiseTimeByMonthKeys();
      this.showButtonRefresh = true;
    }
  }

  private async updateTimeTotalsIfNeeded(): Promise<void> {
    if (this.storedApiCall && this.storedApiCall.date === '') {
      this.timeTotals = await LogtimeUtils.getLogtime(this.user!.login, this.timeTotals || {});
    }
  }

  private initialiseTimeByMonthKeys(): void {
    this.timeByMonthKeys = DateUtils.formatTimeByMonthKeys(this.timeByMonthKeys);
  }

  private async fetchLoggedUser() {
    this.user = await firstValueFrom(this.userService.getLoggedUser());
  }

  public async processGetLogtime() {
    const time = new Date().toLocaleTimeString();

    this.timeByMonthKeys = [];
    if (this.storedApiCall && this.storedApiCall.date === this.today && this.storedApiCall.numberCall === 0)
      this.messageError = 'You have reached the maximum number of calls per day';
    else {
      this.showButtonRefresh = false;
      this.timeTotals = await LogtimeUtils.getLogtime(this.user!.login, this.timeTotals || {});
      this.timeByMonthKeys = this.MyObject.keys(this.timeTotals);
      this.checkIfCurrentMonthExsit();
      this.timeByMonthKeys = DateUtils.formatTimeByMonthKeys(this.timeByMonthKeys);
      if (this.storedApiCall && this.storedApiCall.date === this.today) {
        if (this.user!.login !== 'sbaranes' && this.user!.login !== 'agirona' && this.user!.login !== 'dbouron') this.user!.strucCall.numberCall--;
        this.storedApiCall = { date: this.today, numberCall: this.user!.strucCall.numberCall, time: time, lastSaveTime: this.timeTotals, lastSaveMonth: this.timeByMonthKeys };
      } else {
        this.user!.strucCall.numberCall = 5;
        this.storedApiCall = { date: this.today, numberCall: 5, time: time, lastSaveTime: this.timeTotals, lastSaveMonth: this.timeByMonthKeys };
      }
      this.user!.strucCall = this.storedApiCall;
      this.userService.updateUser();
      this.showButtonRefresh = true;
    }
  }

  private checkIfCurrentMonthExsit() {
    const currentMonthKey = DateUtils.getCurrentMonthKey();
    if (!this.timeByMonthKeys.includes(currentMonthKey)) {
      this.timeByMonthKeys.push(currentMonthKey);
      this.timeTotals[currentMonthKey] = {
        details: {},
        total: '0h00', // Initialiser à une chaîne vide pour le nouveau mois si 0 connexion
        heuresAFaires: 0, // Initialiser à 0 pour set apres le nombres d'heures a realiser dans le mois
        heuresDistantiel: 0,
      };
    }
  }

  onFileSelect(event: Event) {
    this.showButtonRefresh = false;
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async () => {
      const csvData = reader.result as string;
      await this.extractData(csvData);
    };
    setTimeout(() => {
      this.showButtonRefresh = true;
    }, 1000);
  }

  async extractData(csvData: string) {
    const allTextLines = csvData.split(/\r\n|\n/);
    for (const line of allTextLines) {
      // Exemple de ligne: "2023-10-09: ['1:19']"
      const regex = /(\d{4}-\d{2}-\d{2}): \['(\d{1,2}):(\d{2})'\]/;
      const match = line.match(regex);

      if (match) {
        const date = match[1];
        const hours = match[2];
        const minutes = match[3];

        const [year, month, day] = date.split('-');
        const monthYear = `${month}/${year}`;
        const dayFormatted = `${parseInt(day, 10)}`; // "dd"
        const timeFormatted = `${parseInt(hours, 10)}h${minutes.padStart(2, '0')}`; // "HHhMM"

        // Vous pouvez maintenant utiliser les valeurs monthYear, dayFormatted, et timeFormatted comme vous le souhaitez
        this.tempTimeUpdates.push({ monthYear, dayFormatted, timeFormatted });
      }
    }
    await this.processTimeUpdates();
  }

  // Méthode à l'intérieur de votre service ou composant responsable de la gestion de oldTimeTotals
  updateHeuresDistantiel(monthYear: string, dayFormatted: string, timeFormatted: string) {
    if (this.currentMonthBeingProcessed !== monthYear) {
      this.currentMonthBeingProcessed = monthYear;

      if (!this.timeTotals[monthYear]) {
        this.timeTotals[monthYear] = {
          details: {},
          total: '',
          heuresAFaires: 0,
          heuresDistantiel: 0, // réinitialisé à 0 pour un nouveau mois
        };
      } else {
        // Si l'entrée pour le mois existe déjà, réinitialisez juste heuresDistantiel
        this.timeTotals[monthYear].heuresDistantiel = 0;
      }
    }

    // ici, vous pouvez décider de la logique que vous voulez pour mettre à jour heuresDistantiel.
    // Cet exemple suppose que vous voulez ajouter le timeFormatted au total existant.
    const existingHeures = this.timeTotals[monthYear].heuresDistantiel || 0;
    const timeParts = timeFormatted.split('h');
    const newHeures = parseInt(timeParts[0], 10) + parseInt(timeParts[1], 10) / 60; // convertit les heures et les minutes en une valeur décimale d'heures
    this.timeTotals[monthYear].heuresDistantiel = existingHeures + newHeures;

    // mettez à jour le total des heures pour ce mois
    this.timeTotals[monthYear].details[dayFormatted] = timeFormatted;
  }

  async processTimeUpdates() {
    for (const update of this.tempTimeUpdates) {
      this.updateHeuresDistantiel(update.monthYear, update.dayFormatted, update.timeFormatted);
    }

    // Après avoir traité toutes les mises à jour, mettez à jour l'utilisateur
    this.user!.strucCall.lastSaveTime = this.timeTotals;
    this.timeByMonthKeys = [];
    this.timeByMonthKeys = this.MyObject.keys(this.timeTotals);
    this.timeByMonthKeys = DateUtils.formatTimeByMonthKeys(this.timeByMonthKeys);
    this.storedApiCall = {
      date: this.today,
      numberCall: this.user!.strucCall.numberCall,
      time: this.user!.strucCall.time,
      lastSaveTime: this.timeTotals,
      lastSaveMonth: this.timeByMonthKeys,
    };
    this.user!.strucCall = this.storedApiCall;
    await this.userService.updateUser();
    this.tempTimeUpdates = [];
  }
}
