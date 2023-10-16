import { getFunctions, httpsCallable } from 'firebase/functions';
import { environment } from 'src/environments/environment.prod';

export interface strucGauge {
  rotationAngle: number;
  hoursRealized: number;
  hoursRemaining: number;
}

export class LogtimeUtils {
  static async getLogtime(login: string, oldTimeTotals: any) {
    let response = await LogtimeUtils.fetchLogtime(login);

    return await this.calculateTimeConnected(response, oldTimeTotals);
  }

  static async fetchLogtime(login: string): Promise<any> {
    const functions = getFunctions();
    const getLogtimeV2 = httpsCallable(functions, 'getLogtimeV2');

    let userlogtime: any;

    await getLogtimeV2({ login: login, client_id: environment.CLIENT_ID, client_secret: environment.CLIENT_SECRET }).then(async (rep: any) => {
      userlogtime = rep.data;
    });
    // console.log('object return = ', userlogtime); // FOR DEBUG
    return userlogtime;
  }

  static async calculateTimeConnected(newData: any, oldTimeTotals: any) {
    oldTimeTotals = oldTimeTotals || {};
    for (const dayKey in newData) {
      // Extract date and time components
      const [year, month, day] = dayKey.split('-');
      const formattedDuration = this.timeToFormattedDuration(newData[dayKey]);
      const yearMonth = `${month}/${year}`;
      const dayWithoutLeadingZero = String(parseInt(day));

      // Si le mois n'est pas déjà dans oldTimeTotals, initialisez-le.
      if (!oldTimeTotals[yearMonth]) {
        oldTimeTotals[yearMonth] = {
          details: {},
          total: '',
          heuresAFaires: 0,
        };
      }

      // Mettre à jour la durée du jour spécifique.
      oldTimeTotals[yearMonth].details[dayWithoutLeadingZero] = formattedDuration;
    }

    // Pour chaque mois dans newData, calculez le total.
    for (const month in newData) {
      const [year, monthNum] = month.split('-');
      const yearMonthKey = `${monthNum}/${year}`;
      if (oldTimeTotals[yearMonthKey]) {
        const monthDetails = oldTimeTotals[yearMonthKey].details;
        const totalDuration = Object.values(monthDetails).reduce<string>((total: any, duration: any) => this.addDurations(total, duration), '0h00');

        // Convertissez le total au format "HH[h]MM".
        const [totalHours, totalMinutes] = totalDuration.split('h');
        oldTimeTotals[yearMonthKey].total = `${parseInt(totalHours)}h${totalMinutes.padStart(2, '0')}`;
      }
    }

    // Boucle sur oldTimeTotals pour s'assurer que 'heuresAFaires' est défini pour chaque mois.
    for (const yearMonth in oldTimeTotals) {
      if (oldTimeTotals.hasOwnProperty(yearMonth)) {
        if (oldTimeTotals[yearMonth].heuresAFaires === undefined) {
          oldTimeTotals[yearMonth].heuresAFaires = 0; // Définissez à 0 si 'heuresAFaires' n'est pas défini
        }
      }
    }
    return oldTimeTotals;
  }

  // Helper method pour convertir le temps au format désiré.
  static timeToFormattedDuration(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
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
