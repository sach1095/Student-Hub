export type TypeUser = 'Student' | 'Administrateur';

export class ParamMapInterface {
  public size_h1: number;
  public size_h1_mobile: number;
  public size_poste: number;
  public size_poste_mobile: number;

  constructor(size_h1: number, size_h1_mobile: number, size_post: number, size_post_mobile: number) {
    this.size_h1 = size_h1;
    this.size_h1_mobile = size_h1_mobile;
    this.size_poste = size_post;
    this.size_poste_mobile = size_post_mobile;
  }
}
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
  public paramMap: ParamMapInterface;
  public isAlternant: boolean;

  constructor(
    id: string,
    name: string,
    login: string,
    type: TypeUser,
    urlImg: string,
    wallet: string,
    campus: string,
    year: string,
    strucCall: StrucCall,
    paramMap: ParamMapInterface,
    isAlternant: boolean
  ) {
    this.id = id;
    this.name = name;
    this.login = login;
    this.type = type;
    this.urlImg = urlImg;
    this.wallet = wallet;
    this.campus = campus;
    this.year = year;
    this.strucCall = strucCall;
    this.paramMap = paramMap;
    this.isAlternant = isAlternant;
  }
}
