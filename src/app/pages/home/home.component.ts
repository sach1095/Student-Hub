import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users';
import { Observable, firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { LogtimeUtils } from 'src/app/models/logtimeUtils';
import { DateUtils } from 'src/app/models/dateUtils';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getFunctions, httpsCallable } from 'firebase/functions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../../../../node_modules/keen-slider/keen-slider.min.css'],
})
export class HomeComponent implements OnInit {
  public user?: User | null;
  public messageError: string = '';
  public showButton = false;
  public timeTotals: any;
  public timeByMonthKeys: string[] = [];
  public MyObject = Object;
  public lastSave: any;
  public lastCallTime: any;
  public storedApiCall: any;
  private today = new Date().toLocaleDateString();
  constructor(private http: HttpClient, private userService: UserService, private storageService: StorageService) {}

  async ngOnInit() {
    await this.fetchLoggedUser();
    if (this.user?.strucCall.numberCall === 6 || this.user?.strucCall.date !== this.today) {
      this.processGetLogtime();
    } else {
      this.storedApiCall = {
        date: this.user!.strucCall.date,
        numberCall: this.user!.strucCall.numberCall,
        time: this.user!.strucCall.time,
        lastSaveTime: this.user!.strucCall.lastSaveTime,
        lastSaveMonth: this.user!.strucCall.lastSaveMonth,
      };
      this.timeTotals = this.storedApiCall.lastSaveTime;
      this.timeByMonthKeys = this.MyObject.keys(this.timeTotals);
      if (this.storedApiCall.data === '') this.timeTotals = await LogtimeUtils.getLogtime(this.user!.id);
      this.checkIfCurrentMonthExsit();
      this.timeByMonthKeys = DateUtils.formatTimeByMonthKeys(this.timeByMonthKeys);
      this.showButton = true;
    }
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
      this.showButton = false;
      this.timeTotals = await LogtimeUtils.getLogtime(this.user!.id);
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
      this.showButton = true;
    }
  }

  private checkIfCurrentMonthExsit() {
    const currentMonthKey = DateUtils.getCurrentMonthKey();
    if (!this.timeByMonthKeys.includes(currentMonthKey)) {
      this.timeByMonthKeys.push(currentMonthKey);
      this.timeTotals[currentMonthKey] = {
        details: {},
        total: '0h00', // Initialiser à une chaîne vide pour le nouveau mois si 0 connexion
      };
    }
  }
}
