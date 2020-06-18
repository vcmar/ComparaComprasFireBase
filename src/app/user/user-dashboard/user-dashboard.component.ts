import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Purchase } from './../../models/purchase';
import { PurchaseItem } from './../../models/purchase-item';

import { FirebaseService } from './../../services/firebase.service';
import { AppToastService } from './../../services/app-toast.service';
import { AuthService } from './../../services/auth.service';

import { faEdit, faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public myPurchases: Purchase[] = [];
  public productsFromSelectedPurchase: PurchaseItem[] = [];
  public isLoadingPurchases = true;

  public faEdit = faEdit;
  public faEye = faEye;

  // Criar um emissor
  public prodsFromPurchase: Subject<PurchaseItem[]> = new Subject();
  public listTitle = 'Produtos na compra selecionada...';
  public shouldDisplayTable = false;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  displayedColumns: string[] = ['date', 'place', 'options'];
  public purchaseDataSource: MatTableDataSource<Purchase>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  constructor(

    private router: Router,
    private fbs: FirebaseService,
    private authService: AuthService,
    private toastService: AppToastService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getMyLatestPurchases();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
    this.toastService.reset();
  }

  getMyLatestPurchases(): void {
    this.subscriptions.push(
      this.fbs.getAllItens<Purchase>('purchases', 'date')
        .subscribe((p) => {
          this.myPurchases = p.sort((a, b) => (a.date < b.date) ? 1 : -1);
          this.isLoadingPurchases = false;

          this.purchaseDataSource = new MatTableDataSource(this.myPurchases);
          this.purchaseDataSource.paginator = this.paginator;
          this.purchaseDataSource.sort = this.sort;
        })
    );
  }

  showProducts(item: Purchase): void {
    this.productsFromSelectedPurchase = item.lst;
    this.shouldDisplayTable = true;

    this.listTitle = 'Em ' + new Date(item.date).toLocaleDateString() + ' , os seguintes produtos foram comprados no local: ' + item.place;

    // emitir uma nova lista, assincrono
    setTimeout(() => {
      this.prodsFromPurchase.next(item.lst);
    }, 10);
    // this.prodsFromPurchase.next(item.lst);
  }

  editPurchase(item: Purchase): void {
    this.router.navigate(['user/purchase/', item.id]);
  }

}
