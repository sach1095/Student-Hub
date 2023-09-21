export type TypeUser = 'Student' | 'Administrateur';

export class StrucCall {
  public date: string;
  public time: string;
  public numberCall: number;
  public lastSaveTime: any;
  public lastSaveMonth: string[];

  constructor(date: string, time: string, numberCall: number, lastSaveTime: any, lastSaveMonth: string[]) {
    this.date = date;
    this.time = time;
    this.numberCall = numberCall;
    this.lastSaveTime = lastSaveTime;
    this.lastSaveMonth = lastSaveMonth;
  }
}

export class User {
  public id: string;
  public name: string;
  public login: string;
  public type: TypeUser;
  public urlImg: string;
  public wallet: string;
  public campus: string;
  public year: string;
  public strucCall: StrucCall;

  constructor(id: string, name: string, login: string, type: TypeUser, urlImg: string, wallet: string, campus: string, year: string, strucCall: StrucCall) {
    this.id = id;
    this.name = name;
    this.login = login;
    this.type = type;
    this.urlImg = urlImg;
    this.wallet = wallet;
    this.campus = campus;
    this.year = year;
    this.strucCall = strucCall;
  }
}
