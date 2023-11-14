import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnChanges {
  @Input() public timeTotals: any;
  @Input() public month: string = '';
  @Input() public isAlternant!: boolean;
  weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  weeks: Array<Array<number | null>> = [];
  hoveredDayHours: string | null = null;
  hoursForDays: { [key: number]: string } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['month']) {
      this.generateCalendar();
    }
  }

  generateCalendar(): void {
    this.weeks = [];
    this.hoursForDays = {};
    const [month, year] = this.month.split('/').map(Number);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    let dayOfWeek = firstDayOfMonth.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    let week: Array<number | null> = Array(dayOfWeek).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      this.hoursForDays[day] = this.getHoursForDay(day);
      if (week.length === 7 || day === daysInMonth) {
        while (week.length < 7) {
          week.push(null);
        }
        this.weeks.push(week);
        week = [];
      }
    }
  }

  getHoursForDay(day: number): string {
    if (!day && !this.isAlternant) return '0H00';
    else if (!day) return 'Pres : 0H00 | Dis: 0H00';
    const dayStr = day.toString();
    let resultDetails = '0H00';
    let resultDetailsDistentielle = '0H00';

    if (this.timeTotals) {
      if (day && this.timeTotals.details && this.timeTotals.details[dayStr]) {
        resultDetails = this.timeTotals.details[dayStr];
      }
      if (day && this.isAlternant && this.timeTotals.detailsDistentielle && this.timeTotals.detailsDistentielle[dayStr]) {
        resultDetailsDistentielle = this.timeTotals.detailsDistentielle[dayStr];
      }
    }

    if (this.isAlternant) {
      return 'Pres : ' + resultDetails + ' | Dis: ' + resultDetailsDistentielle;
    }
    return resultDetails;
  }

  getBackgroundColor(hours: string): string {
    if (hours === '0H00' || hours === 'Pres : 0H00 | Dis: 0H00') return `rgba(92, 38, 109, 0)`;

    const parsedHours: string[] = hours.split('h');
    let nbHours: number = +parsedHours[0];
    const maxHours: number = 24;
    const minLightness = 20;
    const maxLightness = 80;

    // Calcul de la luminosité en fonction du nombre d'heures
    let lightness;
    if (!this.isAlternant) lightness = (nbHours / maxHours) * (maxLightness - minLightness) + minLightness;
    else {
      const { presentiel, distantiel } = this.extractHours(hours);
      nbHours = presentiel + distantiel;
      lightness = (nbHours / maxHours) * (maxLightness - minLightness) + minLightness;
    }

    lightness = Math.max(minLightness, Math.min(lightness, maxLightness));

    return `hsl(276, 48%, ${lightness}%)`;
  }

  extractHours(input: string): { presentiel: number; distantiel: number } {
    const parts = input.split('|');
    if (parts.length === 2) {
      const presentielPart = parts[0].replace('Pres : ', '').split('h')[0];
      const distantielPart = parts[1].replace(' Dis: ', '').split('h')[0];

      const presentielHours = parseInt(presentielPart, 10);
      const distantielHours = parseInt(distantielPart, 10);

      return {
        presentiel: isNaN(presentielHours) ? 0 : presentielHours,
        distantiel: isNaN(distantielHours) ? 0 : distantielHours,
      };
    } else {
      // Retourne 0 si le format est incorrect
      return {
        presentiel: 0,
        distantiel: 0,
      };
    }
  }
}
