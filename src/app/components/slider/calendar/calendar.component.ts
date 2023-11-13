import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnChanges {
  @Input() public timeTotals: any;
  @Input() public month: string = '';
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
    if (!day) return '0H00';
    const yearMonth = this.month;
    const dayStr = day.toString();

    if (this.timeTotals) {
      if (day && this.timeTotals.details && this.timeTotals.details[dayStr]) {
        return this.timeTotals.details[dayStr];
      }
    }

    return '0H00';
  }
}
