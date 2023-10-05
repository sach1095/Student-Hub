import { Injectable } from '@angular/core';
import { User } from '../models/users';
import { UserMatrice } from '../models/matrice';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storageUserKey = 'user';
  private _storageMatriceIndex = 'matriceIndex';
  private _storageUsersMatrice = 'usersIndex';

  public getUser(): User | null {
    const user = localStorage.getItem(this._storageUserKey);
    return user ? JSON.parse(user) : null;
  }
  public saveUser(user: User) {
    localStorage.setItem(this._storageUserKey, JSON.stringify(user));
  }

  public getMatriceIndex(): number | null {
    const settins = localStorage.getItem(this._storageMatriceIndex);
    return settins ? JSON.parse(settins) : null;
  }
  public saveMatriceIndex(user: number) {
    localStorage.setItem(this._storageMatriceIndex, JSON.stringify(user));
  }

  public getUsersMatrice(): UserMatrice[] | null {
    const users = localStorage.getItem(this._storageUsersMatrice);
    return users ? JSON.parse(users) : null;
  }
  public saveUsersMatrice(usersMatrice: UserMatrice[]) {
    localStorage.setItem(this._storageUsersMatrice, JSON.stringify(usersMatrice));
  }
}
