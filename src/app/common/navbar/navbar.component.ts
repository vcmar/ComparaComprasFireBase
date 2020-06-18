import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { AuthUser } from 'src/app/models/auth-user';
import { Router } from '@angular/router';
import { faUserAlt, faSignInAlt, faSignOutAlt, faStoreAlt, faShoppingCart} from '@fortawesome/free-solid-svg-icons';
import { faTags, faUsers, faTools, faBoxOpen, faCopyright, faBoxes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

// import { faCoffee } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  public currentUser: AuthUser;
  private subscriptions: Subscription[] = [];
  public isMenuCollapsed = true;
  // Icones do menu:
  faLogin = faSignInAlt;
  faLogout = faSignOutAlt;
  faUser = faUserAlt;
  faMercados = faStoreAlt;
  faCompras = faShoppingCart;
  faProdutos = faTags;
  faUserList = faUsers;
  faAdmin = faTools;
  faPackage = faBoxOpen;
  faBrand = faCopyright;
  faCategory = faBoxes;
  faInfo = faInfoCircle;


  constructor(
    public authService: AuthService, public router: Router) {
    this.currentUser = null;
  }

  ngOnInit(): void {
    // Change detection no usuário autenticado
    this.subscriptions.push(
      this.authService.userSubject.subscribe(p => {
        this.currentUser = p;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }

  logout() {
    this.authService.AuthLogout();
    this.router.navigate(['/home']);
  }
}
