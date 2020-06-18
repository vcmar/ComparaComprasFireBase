import { socialProvider } from './../../models/auth-user';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  faGoogle = faGoogle;
  faMicrosoft = faMicrosoft;



  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }

  ngOnInit(): void {

  }

  socialLogin(sProvider: socialProvider) {
    this.authService.SocialAuth(sProvider).then(
      () => {
        // Após o SocialAuth de sucesso, assinar detecção de mudança nos dados de usuário
        this.subscriptions.push(
          this.authService.userSubject.subscribe((p) => {
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
            this.router.navigate([returnUrl || '/user/dashboard']);
          })
        );
      }
    ).catch((error) => {
      console.log('socialLogin error: ', error);
    });
  }
}
