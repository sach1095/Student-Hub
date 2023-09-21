import { Component, Input, OnInit } from '@angular/core';
import { DateUtils } from 'src/app/models/dateUtils';
import { strucGauge } from 'src/app/models/logtimeUtils';

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

  async ngOnInit() {
    this.setGauge(this.timeTotals);
  }

  private setGauge(timeTotals: any) {
    let heuresToDo = DateUtils.getWorkingHoursOfMonthByDates(this.month);
    if (!timeTotals) this.strucGauge.hoursRealized = 0;
    else {
      this.strucGauge.hoursRealized = DateUtils.convertTimeStringToHours(timeTotals.total);
    }
    this.strucGauge.hoursRemaining = heuresToDo - this.strucGauge.hoursRealized!;
    // if (this.strucGauge.hoursRemaining < 0 || this.strucGauge.hoursRealized > heuresToDo) this.strucGauge.hoursRemaining = heuresToDo;

    // Formatter les valeurs des heures réalisées et restantes au format H:mm
    this.showHoursRealized = this.formatHours(this.strucGauge.hoursRealized);
    this.showHoursRemaining = this.formatHours(this.strucGauge.hoursRemaining);

    if (this.strucGauge.hoursRemaining < 0 || this.strucGauge.hoursRealized > heuresToDo ){
      this.strucGauge.rotationAngle = 180;
      this.hoursRealized = true;
    }
    else
      this.strucGauge.rotationAngle = (this.strucGauge.hoursRealized! / heuresToDo) * 180;
  }

  private formatHours(hours: number): string {
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    return `${hoursInt}h${minutes.toString().padStart(2, '0')}`;
  }
}
