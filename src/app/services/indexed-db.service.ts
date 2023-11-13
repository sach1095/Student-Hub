import { Injectable } from '@angular/core';
import { User } from '../models/users';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private db!: IDBPDatabase;

  async connectToDb() {
    if (!this.db) {
      this.db = await openDB('StudentHubDb', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('users')) {
            db.createObjectStore('users', { keyPath: 'id' });
          }
        },
      });
    }
  }

  async saveUser(user: User) {
    await this.connectToDb();
    return this.db.put('users', user);
  }

  async getUser(): Promise<User | null> {
    await this.connectToDb();
    const allUsers = await this.db.getAll('users');
    return allUsers[0] || null;
  }

  public async clearDatabase(): Promise<void> {
    await this.connectToDb();
    // Suppression de toutes les données des l'objects store
    await this.db.clear('users');
  }

  // Méthode pour fermer la base de données
  public closeDatabase(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
