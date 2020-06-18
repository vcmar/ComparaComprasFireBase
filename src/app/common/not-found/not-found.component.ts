import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit, OnDestroy {
  path: string;
  subscriptions: Subscription[] = [];
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.subscriptions.push(this.route.data.pipe(take(1))
      .subscribe((data: { path: string }) => {
        this.path = data.path;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }
}
