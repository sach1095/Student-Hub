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
  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.fetchLoggedUser();

    this.initialiseStoredApiCall();
    this.handleGetLogtime();
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
        this.user!.strucCall.numberCall--;
        this.storedApiCall = { date: this.today, numberCall: this.user!.strucCall.numberCall, time: time, lastSaveTime: this.timeTotals, lastSaveMonth: this.timeByMonthKeys };
      } else {
        this.user!.strucCall.numberCall = 5;
        this.storedApiCall = { date: this.today, numberCall: 5, time: time, lastSaveTime: this.timeTotals, lastSaveMonth: this.timeByMonthKeys };
      }
      this.user!.strucCall = this.storedApiCall;
      this.userService.update(this.user!);
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
      };
    }
  }
}
