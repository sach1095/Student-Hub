import { ElementRef, Injectable } from '@angular/core';
import { Firestore, getDoc } from '@angular/fire/firestore';
import { collection, doc } from '@firebase/firestore';
import { StorageService } from './storage.service';
import { Matrice, UserMatrice } from '../models/matrice';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserMatriceService {
  private languageCollection = collection(this.firestore, 'matrice');
  private matrice?: Matrice;
  private lastFetchTime?: Date;
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
    this.lastFetchTime = new Date();
    if (this.matrice) this.storageService.saveUsersMatrice(this.matrice);
    return this.matrice;
  }

  public async getUsers(): Promise<Matrice | undefined> {
    if (!this.lastFetchTime || this.shouldRefetch(this.lastFetchTime)) {
      return this.fetchMatrice();
    }

    const storedUsersMatrice = this.storageService.getUsersMatrice();
    if (storedUsersMatrice) return storedUsersMatrice;

    return this.fetchMatrice();
  }

  private shouldRefetch(lastFetchTime: Date): boolean {
    const now = new Date();
    const nextFetchMinute = Math.ceil(now.getMinutes() / 5) * 5 + 1; // Gets the next full 5th minute + 1
    const nextFetchTime = new Date(now);
    nextFetchTime.setMinutes(nextFetchMinute, 0, 0); // Sets next fetch time

    // If last fetch time is before the next fetch time and current time is after the next fetch time, refetch.
    return lastFetchTime < nextFetchTime && now >= nextFetchTime;
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
}
