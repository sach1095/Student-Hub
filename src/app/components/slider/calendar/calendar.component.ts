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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['month']) {
      this.generateCalendar();
    }
    console.log('this.timeTotals');
    console.log(this.timeTotals);
  }

  generateCalendar(): void {
    this.weeks = [];
    const [month, year] = this.month.split('/').map(Number);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    let dayOfWeek = firstDayOfMonth.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday is 0, Sunday is 6

    let week: Array<number | null> = Array(dayOfWeek).fill(null); // Start with empty days, explicit type declaration

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
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
    const yearMonth = this.month;
    // console.log("DEbug")
    if (day && this.timeTotals[yearMonth] && this.timeTotals[yearMonth].details[day]) {
      return `${this.timeTotals[yearMonth].details[day]}`;
    }
    return '0H00';
  }
}
