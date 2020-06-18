import { FirebaseService } from 'src/app/services/firebase.service';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { AuthUser, socialProvider } from '../models/auth-user';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser: AuthUser;

  // criar um BehaviorSubject...
  public userSubject: BehaviorSubject<AuthUser> = new BehaviorSubject(null);

  constructor(
    public afAuth: AngularFireAuth,
    private fbs: FirebaseService) {
    this.checkLocalStorage();
  }

  /** Verifica se o usuário já encontra-se autenticado
   * Compara o id do usuário no jwt token (token) com
   * o valor armazenado em userData.
   */
  checkLocalStorage() {
    const jwt = localStorage.getItem('token');
    const localUser = localStorage.getItem('userData');
    const jwtHelper = new JwtHelperService();

    if (jwt && localUser) {
      // console.log('jwt: ', jwt);
      // console.log('localUser: ', localUser);
      const decodedToken = jwtHelper.decodeToken(jwt);
      const isExpired = jwtHelper.isTokenExpired(jwt);
      // console.log('decoded jwt Token: ', decodedToken);
      // console.log('decoded jwt Token isExpired: ', isExpired);
      if (!isExpired) {
        // Se o token de autenticação não expirou e representa o mesmo usuário...
        if ((JSON.parse(localUser) as AuthUser).id === decodedToken.user_id) {
          this.currentUser = (JSON.parse(localUser) as AuthUser);
          this.userSubject.next(this.currentUser);
        } else {
          // Se tem diferença, remove token
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      } else {
        // se está expirado, remove o token
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
  }

  SocialAuth(sProvider: socialProvider) {
    if (sProvider === socialProvider.google) {
      return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
    }
    if (sProvider === socialProvider.microsoft) {
      return this.AuthLogin(new firebase.auth.OAuthProvider('microsoft.com'));
    }
  }

  AuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
      .then((result) => {
        const userCredential: firebase.auth.UserCredential = result;
        const user: firebase.User = userCredential.user;

        // Grava o token de acesso no localstorage
        user.getIdToken().then((p) => {
          localStorage.setItem('token', p);
        });

        this.currentUser = new AuthUser(user.uid, user.email, user.displayName, user.photoURL);
        // Ok, temos os dados do usuário

        // Ele existe no banco ??
        this.fbs.getSingleItem<AuthUser>(user.uid, 'users').pipe(take(1)).subscribe(p => {
          if (p) {
            // ele já existe no banco!!
            if (p.isAdmin) {
              this.currentUser.isAdmin = p.isAdmin;
              this.currentUser.isApproved = p.isApproved;
            }
          }
          // se já existe, vai atualizar. Se não existe, vai criar...
          // Se a chamada anterior não retornar um usuário por erro,
          // vai sobreescrever o usuário forçando o flag de admin como false.
          this.fbs.saveOrUpdate<AuthUser>(this.currentUser, 'users').pipe(take(1)).subscribe();

          // grava no localstorage no fim de tudo
          localStorage.setItem('userData', JSON.stringify(this.currentUser));
          // emite usuario para menu.
          this.userSubject.next(this.currentUser);
        });
      })
      .catch((error) => {
        console.log('Erro no login', error);
      });
  }

  AuthLogout() {
    this.afAuth.signOut();
    this.currentUser = null;
    this.userSubject.next(this.currentUser);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
  }
}
