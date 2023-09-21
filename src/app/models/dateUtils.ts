import { endOfMonth, format, startOfMonth, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

export class DateUtils {
  static getCurrentMonthKey(): string {
    const currentDate = new Date();
    return `${format(currentDate, 'MM')}/${format(currentDate, 'yyyy')}`;
  }

  static lastDayOfMonth(): string {
    const currentDate = new Date();
    const lastDay = endOfMonth(currentDate);
    return format(lastDay, 'dd');
  }

  static getMonthNameFromDate(dateString: string) {
    const parsedDate = parse(dateString, 'MM/yyyy', new Date());
    const monthName = format(parsedDate, 'LLLL', { locale: fr });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const year = format(parsedDate, 'yyyy');
    return capitalizedMonth + ' ' + year;
  }

  static isCurrentMonth(date: string): boolean {
    return date === this.getCurrentMonthKey();
  }

  static getMonthYearKey(date: Date): string {
    return format(date, 'MM/yyyy');
  }

  static firstDayOfMonth() {
    const currentDate = new Date();
    const firstDayOfMonth = startOfMonth(currentDate);
    return format(firstDayOfMonth, 'yyyy-MM-dd');
  }

  static formatTimeByMonthKeys(timeByMonthKeys: string[]): string[] {
    timeByMonthKeys.sort((a, b) => {
      const monthA = Number(a.split('/')[0]);
      const yearA = Number(a.split('/')[1]);
      const monthB = Number(b.split('/')[0]);
      const yearB = Number(b.split('/')[1]);

      if (yearA !== yearB) return yearB - yearA; // Tri décroissant des années
      else return monthB - monthA; // Tri décroissant des mois de la même année
    });
    if (timeByMonthKeys.length > 2) timeByMonthKeys.pop();

    const reversedTimeByMonthKeys = [...timeByMonthKeys].reverse();

    return reversedTimeByMonthKeys;
  }

  static convertTimeStringToHours(timeString: string): number {
    const [hours, minutes] = timeString.split('h');

    const hoursValue = parseInt(hours);
    const minutesValue = parseInt(minutes);

    return hoursValue + minutesValue / 60;
  }

  static getPreviousMonthKey(): string {
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    return `${format(previousMonth, 'MM')}/${format(previousMonth, 'yyyy')}`;
  }

  static getWorkingHoursOfMonth(): number {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = DateUtils.isHolidayDate(date);

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }

    return workingDays * 7;
  }

  static getWorkingHoursOfMonthByDates(date: string): number {
    const [month, year] = date.split('/');
    const currentYear = parseInt(year, 10);
    const currentMonth = parseInt(month, 10) - 1; // Soustraire 1 car les mois dans JavaScript commencent à partir de 0
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = DateUtils.isHolidayDate(currentDate);

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }

    return workingDays * 7;
  }

  static isHolidayDate(date: Date): boolean {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Janvier est 0, février est 1, etc.
    const day = date.getDate();

    // Jours fériés fixes en France
    const fixedHolidays = [
      `01/01`, // Jour de l'An
      `05/01`, // Fête du Travail
      `05/08`, // Victoire 1945
      `07/14`, // Fête nationale
      `08/15`, // Assomption
      `11/01`, // Toussaint
      `11/11`, // Armistice 1918
      `12/25`, // Noël
    ];

    // Jours fériés variables en France (calculés selon des règles spécifiques)
    const easterDate = DateUtils.getEasterDate(year);
    const easterMonday = DateUtils.getEasterMondayDate(easterDate);
    const ascension = new Date(easterDate.getFullYear(), easterDate.getMonth(), easterDate.getDate() + 39); // Ascension = Pâques + 39 jours
    const pentecostMonday = new Date(easterDate.getFullYear(), easterDate.getMonth(), easterDate.getDate() + 50); // Lundi de Pentecôte = Pâques + 50 jours

    const variableHolidays = [DateUtils.formatDate(easterDate), DateUtils.formatDate(easterMonday), DateUtils.formatDate(ascension), DateUtils.formatDate(pentecostMonday)];

    const formattedDate = DateUtils.formatDate(date);

    return fixedHolidays.includes(formattedDate) || variableHolidays.includes(formattedDate);
  }

  static formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }

  // Fonction pour calculer la date de Pâques (Algorithme de Gauss)
  static getEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n0 = h + l + 7 * m + 114;
    const month = Math.floor(n0 / 31) - 1;
    const day = (n0 % 31) + 1;
    return new Date(year, month, day);
  }

  // Fonction pour calculer le Lundi de Pâques
  static getEasterMondayDate(easterDate: Date): Date {
    const easterMonday = new Date(easterDate.getFullYear(), easterDate.getMonth(), easterDate.getDate() + 1);
    return easterMonday;
  }

  // Fonction pour calculer l'Ascension
  static getAscensionDate(year: number): Date {
    const easterDate = DateUtils.getEasterDate(year);
    const ascension = new Date(easterDate.getFullYear(), easterDate.getMonth(), easterDate.getDate() + 39);
    return ascension;
  }

  // Fonction pour calculer le Lundi de Pentecôte
  static getPentecostMondayDate(year: number): Date {
    const easterDate = DateUtils.getEasterDate(year);
    const pentecostMonday = new Date(easterDate.getFullYear(), easterDate.getMonth(), easterDate.getDate() + 50);
    return pentecostMonday;
  }
}
