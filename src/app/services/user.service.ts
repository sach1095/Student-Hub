import { Injectable } from '@angular/core';
import { deleteDoc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { collection, doc, updateDoc } from '@firebase/firestore';
import { BehaviorSubject, firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { ParamMapInterface, StrucCall, User } from 'src/app/models/users';
import { StorageService } from './storage.service';
import { IndexedDBService } from './indexed-db.service';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection = collection(this.firestore, 'users');
  private _loggedUser = new BehaviorSubject<User | null>(null);
  private _initCompleted = new ReplaySubject<boolean>(1);
  private _userDatas: User | null = null;

  private _isSomethingChanged = new BehaviorSubject<boolean>(false);

  get isSomethingChanged$(): Observable<boolean> {
    return this._isSomethingChanged.asObservable();
  }

  get initCompleted$(): Observable<boolean> {
    return this._initCompleted.asObservable();
  }

  set isSomethingChanged(value: boolean) {
    this._isSomethingChanged.next(value);
  }

  constructor(private readonly firestore: Firestore, private indexedDBService: IndexedDBService, private router: Router, private location: Location) {}

  // ================= Handling logged in user ================= \\
  public async initUserDatas() {
    // on App init : load user datas from storage if exists and redirect to home page
    const dbUser = await this.indexedDBService.getUser();
    if (dbUser) {
      this._userDatas = new User(dbUser.id, dbUser.name, dbUser.login, dbUser.type, dbUser.urlImg, dbUser.wallet, dbUser.campus, dbUser.year, dbUser.strucCall, dbUser.paramMap);
      this._loggedUser.next(this._userDatas);
      this.setUserData(this._userDatas.id);
      this._initCompleted.next(true);
      // this.router.navigate(['/home']);
    } else {
      this._initCompleted.next(false);
      this.router.navigate(['/login']);
    }
  }

  public async setUserData(uid: string): Promise<User | null> {
    this._userDatas = await this.fetchUser(uid);
    if (this._userDatas) {
      const today = new Date().toLocaleDateString();
      if (this._userDatas.strucCall && this._userDatas.strucCall.date !== today) {
        this._userDatas.strucCall.date = today;
        this._userDatas.strucCall.numberCall = 6;
        this.updateUserByUser(this._userDatas);
      }
      this._loggedUser.next(this._userDatas);
      await this.indexedDBService.saveUser(this._userDatas);
      this._initCompleted.next(true);
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
        const defaultParamsMap = new ParamMapInterface(2, 2, 5, 2);
        const paramMap = temp.get('paramMap') || defaultParamsMap;
        const user = new User(
          temp.get('id'),
          temp.get('name'),
          temp.get('login'),
          temp.get('type'),
          temp.get('urlImg'),
          temp.get('wallet'),
          temp.get('campus'),
          temp.get('year'),
          temp.get('strucCall'),
          paramMap
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

  public async resetUser() {
    this._userDatas = null;
    this._loggedUser.next(null);
    await this.indexedDBService.clearDatabase();
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
      paramMap: { size_h1: 2, size_h1_mobile: 2, size_poste: 5, size_poste_mobile: 2 },
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
        new StrucCall(userdb.strucCall.date, userdb.strucCall.time, userdb.strucCall.numberCall, userdb.strucCall.lastSaveTime, userdb.strucCall.lastSaveMonth),
        new ParamMapInterface(userdb.paramMap.size_h1, userdb.paramMap.size_h1_mobile, userdb.paramMap.size_poste, userdb.paramMap.size_poste_mobile)
      );
      this._loggedUser.next(user);
      await this.indexedDBService.saveUser(user);
      this._initCompleted.next(true);
    } catch (error) {
      console.error('User.service : createUser : ', error);
    }
  }

  public async updateUser() {
    const user = await firstValueFrom(this.getLoggedUser());

    if (user) {
      const usersDocumentReference = doc(this.firestore, `users/${user.id}`);
      try {
        await updateDoc(usersDocumentReference, { ...user });
      } catch (error) {
        console.error('User.service : update : ', error);
      }
      await this.indexedDBService.saveUser(user);
      this.isSomethingChanged = false;
    }
  }

  public async updateUserByUser(user: User) {
    if (user) {
      const usersDocumentReference = doc(this.firestore, `users/${user.id}`);
      try {
        await updateDoc(usersDocumentReference, { ...user });
      } catch (error) {
        console.error('User.service : update : ', error);
      }
      await this.indexedDBService.saveUser(user);
    }
  }

  async updateHeuresDistantiel(monthYear: string, dayFormatted: string, timeFormatted: string) {
    const user = await firstValueFrom(this.getLoggedUser());
    // Vérifiez si l'entrée pour ce mois existe, sinon, créez-la
    if (!user?.strucCall.lastSaveTime.timeTotals[monthYear]) {
      user!.strucCall.lastSaveTime.timeTotals[monthYear] = {
        details: {},
        total: '',
        heuresAFaires: 0,
        heuresDistantiel: 0,
      };
    }

    if (user) {
      const existingHeures = user.strucCall.lastSaveTime.timeTotals[monthYear].heuresDistantiel || 0;
      const timeParts = timeFormatted.split('h');
      const newHeures = parseInt(timeParts[0], 10) + parseInt(timeParts[1], 10) / 60; // convertit les heures et les minutes en une valeur décimale d'heures
      user.strucCall.lastSaveTime.timeTotals[monthYear].heuresDistantiel = existingHeures + newHeures;

      // mettez à jour le total des heures pour ce mois
      user.strucCall.lastSaveTime.timeTotals[monthYear].details[dayFormatted] = timeFormatted;

      // sauvegardez les modifications apportées à oldTimeTotals où il est stocké
      // this.setOldTimeTotals(oldTimeTotals);
    }
  }

  public async delete(id: string) {
    const usersDocumentReference = doc(this.firestore, `users/${id}`);
    try {
      await deleteDoc(usersDocumentReference);
    } catch (error) {
      console.error('User.service : delete : ', error);
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
