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
    let refetch = false;

    if (this.lastFetchTime) {
      const timeDiff = new Date().getTime() - this.lastFetchTime.getTime();
      const timeDiffInMinutes = timeDiff / 1000 / 60;
      if (timeDiffInMinutes > 5) refetch = true;
    } else refetch = true;

    if (this.userMatrice.length === 0 || refetch) return this.fetchUsersMatriceLog();

    const storedUsersMatrice = this.storageService.getUsersMatrice();
    if (storedUsersMatrice) return storedUsersMatrice;

    return this.fetchUsersMatriceLog();
  }
}
