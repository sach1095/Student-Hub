import { getFunctions, httpsCallable } from 'firebase/functions';
import { environment } from 'src/environments/environment.prod';
import { format } from 'date-fns';
import * as moment from 'moment-timezone';

export interface strucGauge {
  rotationAngle: number;
  hoursRealized: number;
  hoursRemaining: number;
}

export class LogtimeUtils {
  static async getLogtime(login: string, oldTimeTotals: any) {
    let response = await LogtimeUtils.fetchLogtime(login);

    let test = await this.calculateTimeConnected(response, oldTimeTotals);
    return test;
  }

  static async fetchLogtime(login: string): Promise<any> {
    const functions = getFunctions();
    const getLogtimeV1 = httpsCallable(functions, 'getLogtime');

    let userlogtime: any;

    await getLogtimeV1({ id: login, client_id: environment.CLIENT_ID, client_secret: environment.CLIENT_SECRET }).then(async (rep: any) => {
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

  static async calculateTimeConnected(response: any, oldTimeTotals: any) {
    let newTimeTotals: any = {};

    // Supprimez les sessions qui se chevauchent avant de commencer le traitement.
    const nonOverlappingSessions = this.removeOverlappingSessions(response);
    // Traitement des données de l'API pour obtenir les durées par jour
    nonOverlappingSessions.forEach((item: any) => {
      const sessions = this.splitSessions(item);
      sessions.forEach((session) => {
        // votre code existant pour traiter chaque session
        const beginAt = moment.tz(session.begin_at, 'Europe/Paris');
        const endAt = moment.tz(session.end_at, 'Europe/Paris');

        let duration = moment.duration(endAt.diff(beginAt));

        const totalMinutes = duration.asMinutes();
        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = Math.floor(totalMinutes % 60);
        const remainingSeconds = duration.seconds();

        const formattedDuration = `${hours}h${remainingMinutes.toString().padStart(2, '0')}m${remainingSeconds.toString().padStart(2, '0')}s`;
        const day = beginAt.format('D');
        const yearMonth = beginAt.format('MM/YYYY');

        if (!newTimeTotals[yearMonth]) {
          newTimeTotals[yearMonth] = { details: {} };
        }
        if (!newTimeTotals[yearMonth].details[day]) {
          newTimeTotals[yearMonth].details[day] = formattedDuration;
        } else {
          const existingDuration = newTimeTotals[yearMonth].details[day];
          const totalDuration = this.addDetailedDurations(existingDuration, formattedDuration);
          newTimeTotals[yearMonth].details[day] = totalDuration;
        }
      });
    });

    const sortedMonths = Object.keys(newTimeTotals).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);

      return yearA * 100 + monthA - (yearB * 100 + monthB);
    });

    if (sortedMonths.length) {
      // Récupérer le mois le plus ancien
      const oldestMonth = sortedMonths[0];
      // Récupérer les jours pour ce mois et les trier
      const days = Object.keys(newTimeTotals[oldestMonth].details).sort();

      if (days.length >= 2) {
        // Supprimer les détails pour les deux jours les plus anciens
        delete newTimeTotals[oldestMonth].details[days[0]];
        delete newTimeTotals[oldestMonth].details[days[1]];
      }
    }

    // Mettre à jour l'objet oldTimeTotals avec les nouvelles données
    for (const yearMonth in newTimeTotals) {
      if (!oldTimeTotals[yearMonth]) {
        oldTimeTotals[yearMonth] = { details: {}, total: '', heuresAFaires: 0, heuresDistantiel: 0 };
      }

      for (const day in newTimeTotals[yearMonth].details) {
        oldTimeTotals[yearMonth].details[day] = newTimeTotals[yearMonth].details[day];
      }

      // Calcul du total par mois
      const monthDetails = oldTimeTotals[yearMonth].details;
      const totalDuration = Object.values(monthDetails).reduce((total: any, duration: any) => this.addMonthlyDurations(total, duration), '0h00m00s');
      oldTimeTotals[yearMonth].total = totalDuration;
    }

    // Assurer que toutes les propriétés nécessaires sont présentes
    for (const yearMonth in oldTimeTotals) {
      if (!oldTimeTotals[yearMonth].heuresAFaires) {
        oldTimeTotals[yearMonth].heuresAFaires = 0;
      }
      if (!oldTimeTotals[yearMonth].heuresDistantiel) {
        oldTimeTotals[yearMonth].heuresDistantiel = 0;
      }
    }

    return oldTimeTotals;
  }

  static timeToFormattedDuration(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }

  static addDetailedDurations(duration1: string, duration2: string): string {
    const parts1 = duration1.split(/h|m|s/).filter(Boolean).map(Number);
    const parts2 = duration2.split(/h|m|s/).filter(Boolean).map(Number);

    const hours1 = parts1[0] || 0;
    const minutes1 = parts1[1] || 0;
    const seconds1 = parts1[2] || 0;

    const hours2 = parts2[0] || 0;
    const minutes2 = parts2[1] || 0;
    const seconds2 = parts2[2] || 0;

    let totalSeconds = seconds1 + seconds2;
    let totalMinutes = minutes1 + minutes2;
    let totalHours = hours1 + hours2;

    if (totalSeconds >= 60) {
      totalMinutes += Math.floor(totalSeconds / 60);
      totalSeconds %= 60;
    }

    if (totalMinutes >= 60) {
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes %= 60;
    }

    return `${totalHours}h${totalMinutes.toString().padStart(2, '0')}m${totalSeconds.toString().padStart(2, '0')}s`;
  }

  static addMonthlyDurations(duration1: string, duration2: string): string {
    const detailedDuration = this.addDetailedDurations(duration1, duration2);
    const parts = detailedDuration.split(/h|m/).filter(Boolean).map(Number);

    return `${parts[0]}h${parts[1].toString().padStart(2, '0')}m`;
  }

  static splitSessions(item: any) {
    const sessions = [];

    let currentBeginAt = moment.tz(item.begin_at, 'Europe/Paris');
    let finalEndAt = moment.tz(item.end_at, 'Europe/Paris');

    while (currentBeginAt < finalEndAt) {
      const currentEndAt = currentBeginAt.clone().endOf('day');

      if (currentEndAt > finalEndAt) {
        sessions.push({
          begin_at: currentBeginAt.toISOString(),
          end_at: finalEndAt.toISOString(),
        });
      } else {
        sessions.push({
          begin_at: currentBeginAt.toISOString(),
          end_at: currentEndAt.toISOString(),
        });
      }

      currentBeginAt = currentEndAt.clone().add(1, 'second');
    }

    return sessions;
  }

  static removeOverlappingSessions(response: any) {
    // Triez les sessions par heure de début.
    const sortedSessions = response.sort((a: any, b: any) => a.begin_at.localeCompare(b.begin_at));

    const filtered = sortedSessions.reduce((acc: any[], currentSession: { begin_at: number; end_at: number }, currentIndex: any, array: any) => {
      // S'il n'y a pas de session précédente ou que la session actuelle ne chevauche pas la précédente, l'ajouter telle quelle.
      if (acc.length === 0 || currentSession.begin_at >= acc[acc.length - 1].end_at) {
        acc.push(currentSession);
      } else {
        // S'il y a chevauchement, ajustez la fin de la session précédente pour qu'elle ne chevauche pas la session actuelle.
        const lastSession = acc[acc.length - 1];
        if (lastSession.end_at > currentSession.begin_at) {
          lastSession.end_at = currentSession.begin_at; // Ajustez la fin de la dernière session au début de la session actuelle pour éliminer le chevauchement.
        }
        // Si la session actuelle se termine après la dernière session, l'ajouter à la liste également.
        if (currentSession.end_at > lastSession.end_at) {
          acc.push(currentSession);
        }
      }
      return acc;
    }, []);

    return filtered;
  }
}
