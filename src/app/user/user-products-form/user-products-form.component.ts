import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { faBackward } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-products-form',
  templateUrl: './user-products-form.component.html',
  styleUrls: ['./user-products-form.component.css']
})
export class UserProductsFormComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public faBackward = faBackward;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }

  back() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if(returnUrl) {
      this.router.navigate(['/user/purchase/' + returnUrl ]);
    } else {
      this.router.navigate(['/user/products']);
    }
  }
}
