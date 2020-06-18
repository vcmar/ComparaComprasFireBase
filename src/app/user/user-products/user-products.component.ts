import { Component, OnInit, OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-products',
  templateUrl: './user-products.component.html',
  styleUrls: ['./user-products.component.css']
})
export class UserProductsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }
}
