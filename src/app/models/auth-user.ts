export class AuthUser {
  public id: string;
  public email: string;
  public displayName: string;
  public photoURL: string;
  public isAdmin: boolean;
  public isApproved: boolean;

  constructor(uid: string, email: string, displayName: string, photoURL: string) {
    this.id = uid;
    this.email = email;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.isAdmin = false;
  }
}

export enum socialProvider {
  google = 1, microsoft = 2
}
