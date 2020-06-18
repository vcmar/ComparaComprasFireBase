import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { of, Observable, Subscription, interval, pipe, from, zip } from 'rxjs';
import { faBackward } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-products-form',
  templateUrl: './admin-products-form.component.html',
  styleUrls: ['./admin-products-form.component.css']
})
export class AdminProductsFormComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public faBackward = faBackward;

  constructor(  ) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }
}
