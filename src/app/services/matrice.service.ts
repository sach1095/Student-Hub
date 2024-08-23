import { ElementRef, Injectable } from '@angular/core';
import { Firestore, getDoc } from '@angular/fire/firestore';
import { collection, doc } from '@firebase/firestore';
import { StorageService } from './storage.service';
import { Matrice, UserMatrice } from '../models/matrice';
import { BehaviorSubject, Observable } from 'rxjs';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UserMatriceService {
  private languageCollection = collection(this.firestore, 'matrice');
  private matrice?: Matrice;
  private lastFetchTime?: Date | null = null;
  private posteListSubject = new BehaviorSubject<ElementRef[]>([]);

  constructor(private readonly firestore: Firestore, private storageService: StorageService) {}

  private async fetchMatrice() {
    const docRef = doc(this.languageCollection, 'matriceData');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('could not fetch users Connected');
    }

    let data = docSnap.data();
    this.matrice = JSON.parse(data['matriceData']);
    this.lastFetchTime = this.parseDate(data['lastFetchTime']);
    this.storageService.saveLastTimeUpdate(data['lastFetchTime']);

    if (this.matrice) this.storageService.saveUsersMatrice(this.matrice);
    return this.matrice;
  }

  public async getUsers(): Promise<Matrice | undefined> {
    const now = new Date();
    let checkSave = this.storageService.getLastTimeUpdate();
    if (checkSave) this.lastFetchTime = this.parseDate(checkSave);
    // Vérifier si lastFetchTime est défini et si la différence de temps est supérieure à 5 minutes
    if (!this.lastFetchTime || now.getTime() - this.lastFetchTime.getTime() > 5 * 60 * 1000) {
      return await this.fetchMatrice();
    }

    // Si les données sont récentes (moins de 5 minutes), utilisez les données stockées
    const storedUsersMatrice = this.storageService.getUsersMatrice();
    if (storedUsersMatrice) return storedUsersMatrice;

    // Si aucune donnée stockée n'est disponible, rafraîchissez les données
    return this.fetchMatrice();
  }

  public checkIfNeedReload(): boolean {
    const lastFetchTime = this.lastFetchTime!;
    const options = { timeZone: 'Europe/Paris' };
    const now = new Date().toLocaleString('en-US', options);
    if (new Date(now).getTime() - lastFetchTime.getTime() > 5 * 60 * 1000) {
      return true;
    }
    return false;
}

  public async ReloadMatrice() {
    console.log('Fetching new matrice ...');
    // Rafraîchir les données si lastFetchTime est plus vieux que 5 minutes
    const functions = getFunctions();
    const refreshMatrice = httpsCallable(functions, 'refreshMatrice');
    await refreshMatrice({ client_id: environment.CLIENT_ID, client_secret: environment.CLIENT_SECRET });

    // Rafraîchir la matrice après l'attente
    setTimeout(async () => {
      const docRef = doc(this.languageCollection, 'matriceData');
      const updatedDocSnap = await getDoc(docRef);
      if (updatedDocSnap.exists()) {
        let updatedData = updatedDocSnap.data();
        this.matrice = JSON.parse(updatedData['matriceData']);
        this.lastFetchTime = new Date(JSON.parse(updatedData['lastFetchTime']));
      }
      if (this.matrice) this.storageService.saveUsersMatrice(this.matrice);
    }, 20000);
    window.location.reload();
  }

  // Permet aux composants de souscrire à la liste des postes
  getPosteList(): Observable<ElementRef[]> {
    return this.posteListSubject.asObservable();
  }

  // Permet aux composants d'ajouter un poste à la liste
  addPoste(poste: ElementRef): void {
    const currentPostes = this.posteListSubject.getValue();
    currentPostes.push(poste);
    this.posteListSubject.next(currentPostes);
  }

  private parseDate(dateStr: string) {
    if (!dateStr) return new Date(1990, 0, 1, 1, 1, 1);
    const [date, time] = dateStr.split(' ');
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes, seconds] = time.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
}
