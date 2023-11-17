import { Injectable } from '@angular/core';
import { User } from '../models/users';
import { Matrice } from '../models/matrice';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _lastTimeUpdate = 'lastTimeUpdate';
  private _storageUsersMatrice = 'usersIndex';
  private _storageMatriceIndex = 'matriceIndex';

  public getMatriceIndex(): number | null {
    const settins = localStorage.getItem(this._storageMatriceIndex);
    return settins ? JSON.parse(settins) : null;
  }
  public saveMatriceIndex(user: number) {
    localStorage.setItem(this._storageMatriceIndex, JSON.stringify(user));
  }

  public getLastTimeUpdate(): string | null {
    const settins = localStorage.getItem(this._lastTimeUpdate);
    return settins ? JSON.parse(settins) : null;
  }
  public saveLastTimeUpdate(strTime: string) {
    localStorage.setItem(this._lastTimeUpdate, JSON.stringify(strTime));
  }

  public getUsersMatrice(): Matrice | null {
    const users = localStorage.getItem(this._storageUsersMatrice);
    return users ? JSON.parse(users) : null;
  }

  public saveUsersMatrice(usersMatrice: Matrice) {
    localStorage.setItem(this._storageUsersMatrice, JSON.stringify(usersMatrice));
  }
}
