import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { LogtimeUtils } from 'src/app/models/logtimeUtils';
import { DateUtils } from 'src/app/models/dateUtils';
import { formatDate } from '@angular/common';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../../../../node_modules/keen-slider/keen-slider.min.css'],
})
export class HomeComponent implements OnInit {
  public user?: User | null;
  public messageError: string = '';
  public showButtonRefresh = false;
  public showDatePicker = false;
  public timeTotals: any;
  public timeByMonthKeys: string[] = [];
  public MyObject = Object;
  public lastSave: any;
  public lastCallTime: any;
  public storedApiCall: any;
  private today = new Date().toLocaleDateString();
  private tempTimeUpdates: any[] = [];
  private currentMonthBeingProcessed: string | null = null;

  public dateRange = this.formBuilder.group({
    start: [new FormControl<Date | null>(null), [Validators.required]],
    end: [new FormControl<Date | null>(null), [Validators.required]],
  });

  constructor(private userService: UserService, private readonly formBuilder: FormBuilder) {}

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

    if (!this.user.strucCall) {
      await this.processGetLogtime(true);
    } else if (this.user.strucCall.numberCall === 6 || this.user.strucCall.date !== this.today) {
      await this.processGetLogtime(false);
    } else {
      await this.updateTimeTotalsIfNeeded();
      this.checkIfCurrentMonthExsit();
      this.initialiseTimeByMonthKeys();
      setTimeout(() => {
        this.showButtonRefresh = true;
      }, 1000);
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

  public async processGetLogtime(firsTime: boolean) {
    const time = new Date().toLocaleTimeString();

    this.timeByMonthKeys = [];
    if (!firsTime && this.storedApiCall && this.storedApiCall.date === this.today && this.storedApiCall.numberCall === 0)
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
        this.storedApiCall = { date: this.today, numberCall: 5, time: time, lastSaveTime: this.timeTotals, lastSaveMonth: this.timeByMonthKeys };
      }
      this.user!.strucCall = this.storedApiCall;
      this.userService.updateUser();
      setTimeout(() => {
        this.showButtonRefresh = true;
      }, 1000);
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
  updateHeuresDistantiel(monthYear: string, dayFormatted: string, timeFormatted: string, resetDetailsDistentielle: boolean = false) {
    if (this.currentMonthBeingProcessed !== monthYear || resetDetailsDistentielle) {
      this.currentMonthBeingProcessed = monthYear;

      if (!this.timeTotals[monthYear]) {
        this.timeTotals[monthYear] = {
          details: {},
          detailsDistentielle: {},
          total: '',
          heuresAFaires: 0,
          heuresDistantiel: 0, // réinitialisé à 0 pour un nouveau mois
        };
      } else {
        // Si l'entrée pour le mois existe déjà, réinitialisez heuresDistantiel et detailsDistentielle
        if (resetDetailsDistentielle) {
          this.timeTotals[monthYear].detailsDistentielle = {};
        }
        this.timeTotals[monthYear].heuresDistantiel = 0;
      }
    }

    const existingHeures = this.timeTotals[monthYear].heuresDistantiel || 0;
    const timeParts = timeFormatted.split('h');
    const newHeures = parseInt(timeParts[0], 10) + parseInt(timeParts[1], 10) / 60; // convertit les heures et les minutes en une valeur décimale d'heures
    this.timeTotals[monthYear].heuresDistantiel = existingHeures + newHeures;

    this.timeTotals[monthYear].detailsDistentielle[dayFormatted] = timeFormatted;
  }

  async processTimeUpdates() {
    let firstTime = true;

    for (const update of this.tempTimeUpdates) {
      this.updateHeuresDistantiel(update.monthYear, update.dayFormatted, update.timeFormatted, firstTime);
      firstTime = false;
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

  public showDateButton(state: boolean) {
    this.showDatePicker = state;
    if (state === false) {
      this.dateRange = this.formBuilder.group({
        start: [new FormControl<Date | null>(null), [Validators.required]],
        end: [new FormControl<Date | null>(null), [Validators.required]],
      });
    }
  }

  public processExportLogtime(): void {
    const startDate: Date | null | undefined = this.dateRange.get('start')?.value;
    const endDate: Date | null | undefined = this.dateRange.get('end')?.value;
    if (startDate && endDate) this.exportLogtime(startDate, endDate, this.timeTotals);
  }

  private async exportLogtime(startDate: Date, endDate: Date, logtimeData: any) {
    const dates = this.getDatesBetween(startDate, endDate);
    const fileName = `testCSVlogtime-${formatDate(startDate, 'dd-MM-yyyy', 'en-US')}-to-${formatDate(endDate, 'dd-MM-yyyy', 'en-US')}`;
    await this.generateCSVFile(dates, logtimeData, fileName);
    this.showDatePicker = false;
  }

  private getDatesBetween(startDate: Date, endDate: Date): Date[] {
    let dates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = moment(currentDate).add(1, 'days').toDate();
    }

    return dates;
  }

  public async generateCSVFile(dates: Date[], logtimeData: any, fileName: string) {
    // Créez un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();

    // Ajoutez une feuille de calcul au classeur
    const worksheet = workbook.addWorksheet('Logtime');

    let headers = [];
    // En-têtes des colonnes
    if (!this.user!.isAlternant) headers = ['Date', 'Logtime'];
    else headers = ['Date', 'Logtime présentiel ', 'Logtime distanciel'];

    worksheet.addRow(headers);

    dates.forEach((date) => {
      let detailsDistentielle;
      const yearMonth = formatDate(date, 'MM/yyyy', 'en-US');
      const day = formatDate(date, 'd', 'en-US');
      const logtime = logtimeData[yearMonth] && logtimeData[yearMonth].details[day] ? logtimeData[yearMonth].details[day] : '';
      if (this.user!.isAlternant)
        detailsDistentielle =
          logtimeData[yearMonth] && logtimeData[yearMonth].detailsDistentielle && logtimeData[yearMonth].detailsDistentielle[day] ? logtimeData[yearMonth].details[day] : '';
      const formattedDate = formatDate(date, 'dd-MM-yyyy', 'fr-FR');

      let rowData;
      if (!this.user!.isAlternant) rowData = [formattedDate, logtime];
      else rowData = [formattedDate, logtime, detailsDistentielle];
      worksheet.addRow(rowData);
    });

    // Générez le fichier Excel en mémoire
    const buffer = await workbook.xlsx.writeBuffer();

    // Créez un objet Blob à partir du buffer Excel
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Créez l'URL de téléchargement à partir du Blob
    const url = URL.createObjectURL(blob);

    // Créez le lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    link.click();
    URL.revokeObjectURL(url);
  }
}
