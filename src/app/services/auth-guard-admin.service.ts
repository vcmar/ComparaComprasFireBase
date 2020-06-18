import { AuthUser } from './../models/auth-user';
import { FirebaseService } from './firebase.service';
import { AuthService } from 'src/app/services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardAdminService implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private fbs: FirebaseService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean
    | import('@angular/router').UrlTree
    | import('rxjs').Observable<boolean | import('@angular/router').UrlTree>
    | Promise<boolean | import('@angular/router').UrlTree> {

    return this.fbs.getSingleItem<AuthUser>(this.auth.currentUser.id, 'users').pipe(
      map((result) => {
        if (result && result.isAdmin) {
          return true;
        }
        // console.log('usuário não é admin!');
        this.router.navigate(['/unauthorized']);
        return false;
      })
    );
  }
}
