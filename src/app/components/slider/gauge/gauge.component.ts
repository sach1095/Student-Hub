import { Component, Input, OnInit } from '@angular/core';
import { DateUtils } from 'src/app/models/dateUtils';
import { strucGauge } from 'src/app/models/logtimeUtils';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
})
export class GaugeComponent implements OnInit {
  public strucGauge: strucGauge = { rotationAngle: 0, hoursRealized: 0, hoursRemaining: 0 };
  @Input() public timeTotals: any;
  @Input() public month: string = '';
  public showHoursRealized: string = '';
  public showHoursRemaining: string = '';
  public hoursRealized = false;
  public inputHourStatus = false;
  public inputHour = '';

  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.setGauge(this.timeTotals);
  }

  private setGauge(timeTotals: any) {
    this.hoursRealized = false;
    if (timeTotals.heuresAFaires == 0) timeTotals.heuresAFaires = DateUtils.getWorkingHoursOfMonthByDates(this.month);
    if (!timeTotals) this.strucGauge.hoursRealized = 0;
    else {
      this.strucGauge.hoursRealized = DateUtils.convertTimeStringToHours(timeTotals.total) + timeTotals.heuresDistantiel;
    }
    this.strucGauge.hoursRemaining = timeTotals.heuresAFaires - this.strucGauge.hoursRealized!;

    // Formatter les valeurs des heures réalisées et restantes au format H:mm
    this.showHoursRealized = this.formatHours(this.strucGauge.hoursRealized);
    this.showHoursRemaining = this.formatHours(this.strucGauge.hoursRemaining);

    if (this.strucGauge.hoursRemaining < 0 || this.strucGauge.hoursRealized > timeTotals.heuresAFaires) {
      this.strucGauge.rotationAngle = 180;
      this.hoursRealized = true;
    } else this.strucGauge.rotationAngle = (this.strucGauge.hoursRealized! / timeTotals.heuresAFaires) * 180;
    this.inputHourStatus = false;
  }

  private formatHours(hours: number): string {
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    return `${hoursInt}h${minutes.toString().padStart(2, '0')}`;
  }

  public showInputSetHours() {
    this.inputHourStatus = !this.inputHourStatus;
  }

  public setHour(validate: boolean) {
    if (!validate) this.showInputSetHours();
    else {
      let num = parseInt(this.inputHour, 10);
      if (!isNaN(num) && this.timeTotals.heuresAFaires !== num) {
        this.timeTotals.heuresAFaires = num;
        this.setGauge(this.timeTotals);
        this.userService.isSomethingChanged = true;
      }
    }
    this.inputHour = '';
  }
}
