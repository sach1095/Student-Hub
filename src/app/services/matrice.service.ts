import { Injectable } from '@angular/core';
import { Firestore, getDoc } from '@angular/fire/firestore';
import { collection, doc } from '@firebase/firestore';
import { StorageService } from './storage.service';
import { UserMatrice } from '../models/matrice';

@Injectable({
  providedIn: 'root',
})
export class UserMatriceService {
  private languageCollection = collection(this.firestore, 'matrice');
  private userMatrice: UserMatrice[] = [];
  private lastFetchTime?: Date;
  constructor(private readonly firestore: Firestore, private storageService: StorageService) {}

  private async fetchUsersMatriceLog() {
    const docRef = doc(this.languageCollection, 'usersLog');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('could not fetch users Connected');
    }
    this.userMatrice = docSnap.get('finalResponseData');
    this.lastFetchTime = new Date();
    this.storageService.saveUsersMatrice(this.userMatrice);
    return this.userMatrice;
  }

  public async getUsers(): Promise<UserMatrice[]> {
    if (!this.lastFetchTime || this.shouldRefetch(this.lastFetchTime)) {
      return this.fetchUsersMatriceLog();
    }

    if (this.userMatrice.length === 0) return this.fetchUsersMatriceLog();

    const storedUsersMatrice = this.storageService.getUsersMatrice();
    if (storedUsersMatrice) return storedUsersMatrice;

    return this.fetchUsersMatriceLog();
  }

  private shouldRefetch(lastFetchTime: Date): boolean {
    const now = new Date();
    const nextFetchMinute = Math.ceil(now.getMinutes() / 5) * 5 + 1; // Gets the next full 5th minute + 1
    const nextFetchTime = new Date(now);
    nextFetchTime.setMinutes(nextFetchMinute, 0, 0); // Sets next fetch time

    // If last fetch time is before the next fetch time and current time is after the next fetch time, refetch.
    return lastFetchTime < nextFetchTime && now >= nextFetchTime;
  }
}
