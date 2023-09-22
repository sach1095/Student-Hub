import { Injectable } from '@angular/core';
import { deleteDoc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { collection, doc, updateDoc } from '@firebase/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { StrucCall, User } from 'src/app/models/users';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection = collection(this.firestore, 'users');
  private _loggedUser = new BehaviorSubject<User | null>(null);
  private _userDatas: User | null = null;

  private _isSomethingChanged = new BehaviorSubject<boolean>(false);

  get isSomethingChanged$(): Observable<boolean> {
    return this._isSomethingChanged.asObservable();
  }

  set isSomethingChanged(value: boolean) {
    this._isSomethingChanged.next(value);
  }

  constructor(private readonly firestore: Firestore, private storageService: StorageService, private router: Router) {}

  // ================= Handling logged in user ================= \\
  public async initUserDatas() {
    // on App init : load user datas from storage if exists and redirect to home page
    const storageUser = this.storageService.getUser();
    if (storageUser) {
      this._userDatas = new User(
        storageUser.id,
        storageUser.name,
        storageUser.login,
        storageUser.type,
        storageUser.urlImg,
        storageUser.wallet,
        storageUser.campus,
        storageUser.year,
        storageUser.strucCall
      );
      this._loggedUser.next(this._userDatas);
      this.setUserData(this._userDatas.id);
    }
  }

  public async setUserData(uid: string): Promise<User | null> {
    this._userDatas = await this.fetchUser(uid);
    if (this._userDatas) {
      const today = new Date().toLocaleDateString();
      if (this._userDatas.strucCall.date !== today) {
        this._userDatas.strucCall.date = today;
        this._userDatas.strucCall.numberCall = 6;
        this.update(this._userDatas);
      }
      this._loggedUser.next(this._userDatas);
      this.storageService.saveUser(this._userDatas);
      return this._userDatas;
    }
    return null;
  }

  public checkInDbIfUserExiste(uid: string) {
    try {
      const docRef = doc(this.usersCollection, uid);
      if (docRef) return true;
    } catch (error) {
      return false;
    }
    return false;
  }

  public async fetchUser(uid: string): Promise<User | null> {
    try {
      const docRef = doc(this.usersCollection, uid);
      const temp = await getDoc(docRef);
      if (temp.exists()) {
        const user = new User(
          temp.get('id'),
          temp.get('name'),
          temp.get('login'),
          temp.get('type'),
          temp.get('urlImg'),
          temp.get('wallet'),
          temp.get('campus'),
          temp.get('year'),
          temp.get('strucCall')
        );
        return user;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }

  public getLoggedUser(): Observable<User | null> {
    return this._loggedUser.asObservable();
  }

  public resetUser() {
    localStorage.removeItem('user');
    this._userDatas = null;
    this._loggedUser.next(null);
  }

  // ================= Handling application users ================= \\
  public async createUser(user: any, uid: string) {
    const userdb = {
      id: user.id,
      name: user.displayname,
      type: user.kind,
      login: user.login,
      urlImg: user.image.link,
      wallet: user.wallet,
      campus: user.campus[0].name,
      year: user.pool_year,
      strucCall: { date: '', time: '', numberCall: 6, lastSaveTime: '', lastSaveMonth: [] },
    };
    try {
      await setDoc(doc(this.usersCollection, uid), userdb);
      const user = new User(
        userdb.id,
        userdb.name,
        userdb.login,
        userdb.type,
        userdb.urlImg,
        userdb.wallet,
        userdb.campus,
        userdb.year,
        new StrucCall(userdb.strucCall.date, userdb.strucCall.time, userdb.strucCall.numberCall, userdb.strucCall.lastSaveTime, userdb.strucCall.lastSaveMonth)
      );
      this._loggedUser.next(user);
      this.storageService.saveUser(user);
    } catch (error) {
      console.error('User.service : createUser : ', error);
    }
  }

  public async update(user: User) {
    const usersDocumentReference = doc(this.firestore, `users/${user.id}`);
    try {
      await updateDoc(usersDocumentReference, { ...user });
    } catch (error) {
      console.error('User.service : update : ', error);
    }
    this.storageService.saveUser(user);
  }

  public async delete(id: string) {
    const usersDocumentReference = doc(this.firestore, `users/${id}`);
    try {
      await deleteDoc(usersDocumentReference);
    } catch (error) {
      console.error('User.service : delete : ', error);
    }
  }

  public async updateLocalModification() {
    let user = await firstValueFrom(this.getLoggedUser());

    if (user) {
      const usersDocumentReference = doc(this.firestore, `users/${user.id}`);
      try {
        await updateDoc(usersDocumentReference, { ...user });
      } catch (error) {
        console.error('User.service : update : ', error);
      }
      this.storageService.saveUser(user);
    }
  }
}

// peut servire d'exemple pour faire des query sur firebase

// public async getUsers(login: String): Promise<User> {
//   const queryUser = query(this.usersCollection, where('login', '==', login));
//   const docSnap = await getDocs(queryUser);
//   const temp = docSnap.docs[0];
//   const user = new User(temp.get('id'), temp.get('name'), temp.get('login'), temp.get('type'));
//   return user;
// }
