import { Injectable } from '@angular/core';
import { User } from '../models/users';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storageUserKey = 'user';
  private _storageMatriceIndex = 'matriceIndex';

  public getUser(): User | null {
    const user = localStorage.getItem(this._storageUserKey);
    return user ? JSON.parse(user) : null;
  }
  public saveUser(user: User) {
    localStorage.setItem(this._storageUserKey, JSON.stringify(user));
  }

  public getMatriceIndex(): number | null {
    const user = localStorage.getItem(this._storageMatriceIndex);
    return user ? JSON.parse(user) : null;
  }
  public saveMatriceIndex(user: number) {
    localStorage.setItem(this._storageMatriceIndex, JSON.stringify(user));
  }
}
