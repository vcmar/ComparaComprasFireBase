import { AuthUser } from './../../models/auth-user';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './../../services/firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  public users$: Observable<AuthUser[]>;

  constructor(private fbs: FirebaseService) {
    this.users$ = fbs.getAllItens<AuthUser>('users', 'displayName');
  }

  ngOnInit(): void {
  }

  approveUser(usr: AuthUser) {
    usr.isApproved = !usr.isApproved;
    this.fbs.saveOrUpdate<AuthUser>(usr, 'users').subscribe();
  }

  adminUser(usr: AuthUser) {
    usr.isAdmin = !usr.isAdmin;
    this.fbs.saveOrUpdate<AuthUser>(usr, 'users').subscribe();
  }
}
