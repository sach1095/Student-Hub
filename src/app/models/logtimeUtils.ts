import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';
import * as moment from 'moment';
import { environment } from 'src/environments/environment.prod';

export interface strucGauge {
  rotationAngle: number;
  hoursRealized: number;
  hoursRemaining: number;
}

export class LogtimeUtils {
  static async getLogtime(id: string) {
    let response = await LogtimeUtils.fetchLogtime(id);
    return this.calculateTimeConnected(response);
  }

  static async fetchLogtime(id: string): Promise<any> {
    const functions = getFunctions();
    const getLogtime = httpsCallable(functions, 'getLogtime');

    let userlogtime: any;
    await getLogtime({ id: id, client_id: environment.CLIENT_ID, client_secret: environment.CLIENT_SECRET }).then(async (rep: any) => {
      userlogtime = rep.data;
      if (!rep.data[0].end_at) {
        let date_now = '';
        date_now = format(new Date(), 'yyyy-MM-dd').toString() + 'T' + format(new Date(), 'HH:mm:ss').toString() + '.000Z';
        userlogtime[0].end_at = date_now;
      }
    });
    // console.log('object return = ', userlogtime); // FOR DEBUG
    return userlogtime;
  }

  static async calculateTimeConnected(response: any) {
    let timeByMonth: any = {};
    let timeByDay: any = {};

    response.forEach((item: any) => {
      const beginAt = moment(item.begin_at);
      const endAt = moment(item.end_at);
      const duration = moment.duration(endAt.diff(beginAt));

      const minutes = duration.asMinutes();
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.floor(minutes % 60);

      const formattedDuration = `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;

      const day = beginAt.format('D');
      const yearMonth = beginAt.format('MM/YYYY');

      // Temps par jour
      if (!timeByDay[yearMonth]) {
        timeByDay[yearMonth] = {};
      }

      if (!timeByDay[yearMonth][day]) {
        timeByDay[yearMonth][day] = [formattedDuration];
      } else {
        timeByDay[yearMonth][day].push(formattedDuration);
      }

      // Temps par mois
      if (!timeByMonth[yearMonth]) {
        timeByMonth[yearMonth] = {
          details: {},
          total: '',
        };
      }

      if (!timeByMonth[yearMonth].details[day]) {
        timeByMonth[yearMonth].details[day] = formattedDuration;
      } else {
        const existingDuration = timeByMonth[yearMonth].details[day];
        const totalDuration = this.addDurations(existingDuration, formattedDuration);
        timeByMonth[yearMonth].details[day] = totalDuration;
      }
    });

    // Calcul du total par mois
    for (const month in timeByMonth) {
      const monthDetails = timeByMonth[month].details;
      const totalDuration = Object.values(monthDetails).reduce((total: any, duration: any) => this.addDurations(total, duration), '0h00');

      timeByMonth[month].total = totalDuration;
    }
    return timeByMonth;
  }

  static addDurations(duration1: any, duration2: any): string {
    const [hours1, minutes1] = duration1.toString().split('h').map(Number);
    const [hours2, minutes2] = duration2.toString().split('h').map(Number);

    const totalMinutes = minutes1 + minutes2;
    const totalHours = hours1 + hours2 + Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${totalHours}h${remainingMinutes.toString().padStart(2, '0')}`;
  }
}
