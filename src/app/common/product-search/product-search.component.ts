
import { Component, OnInit, OnDestroy, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Subscription, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { faSearchDollar, faExclamation, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { FirebaseService } from './../../services/firebase.service';
import { AppToastService } from './../../services/app-toast.service';

import { Product } from './../../models/product';
import { PurchaseItem } from './../../models/purchase-item';
import { GenericToast } from './../../models/generic-toast';
import { SearchPopupComponent } from './../search-popup/search-popup.component';



@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public isLoading = true;

  public faSearchDollar = faSearchDollar;
  public faExclamation = faExclamation;
  public faTrashAlt = faTrashAlt;

  public availableProducts: Product[];
  public availableProductNames: string[];
  // public purchaseHistory: PurchaseItem[] = [];

  public form: FormGroup;
  public productSearch: FormControl;

  displayedColumns: string[] = ['name', 'brand', 'package', 'uPrice'];
  public prodDataSource: MatTableDataSource<PurchaseItem>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable) resultTable: MatTable<any>;

  @Input() shouldDisplayPlace = true;
  @Input() shouldDisplayDate = true;
  @Input() shouldDisplayQtd = true;
  @Input() shouldDisplayDelete = false;
  @Input() shouldDisplayPriceHistory = false;
  @Input() shouldDisplaySearch = true;
  @Input() shouldDisplayTitle = true;
  @Input() purchaseHistory: PurchaseItem[] = [];
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() prodList: Subject<PurchaseItem[]>;
  @Input() mainTitle = 'Consulta rápida de histórico de preços';
  @Input() historyProductId: string;

  @Output() removeItem: EventEmitter<PurchaseItem> = new EventEmitter<PurchaseItem>();

  constructor(
    private fbs: FirebaseService,
    private toastService: AppToastService,
    private modalService: NgbModal
  ) {
  }

  ngOnDestroy(): void {
    console.log('Total subscriptions to delete: ', this.subscriptions.length);
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.createForm();
    if (this.shouldDisplayDate) {
      this.displayedColumns.push('date');
    }
    if (this.shouldDisplayPlace) {
      this.displayedColumns.push('place');
    }
    if (this.shouldDisplayQtd) {
      this.displayedColumns.splice(3, 0, 'qtd');
    }
    if (this.shouldDisplayDelete) {
      this.displayedColumns.push('options');
    }
    if (this.shouldDisplayPriceHistory) {
      this.displayedColumns.push('history');
    }
    if (this.prodList) {
      this.subscriptions.push(
        this.prodList.subscribe(p => {
          this.prodDataSource = new MatTableDataSource(p);
          this.prodDataSource.paginator = this.paginator;
          this.prodDataSource.sort = this.sort;
        }));
    }
    if (this.shouldDisplaySearch) {
      this.subscriptions.push(
        this.fbs.getSharedCollections<Product>('shared', 'products', 'lst').subscribe((p) => {
          if (p) {
            this.availableProductNames = [...new Set(p.map((el) => el.name))];
          }
          this.isLoading = false;
          this.productSearch.enable();
        })
      );
    } else {
      this.isLoading = false;
    }

    if (this.historyProductId) {
      // console.log('this.historyProductId: ', this.historyProductId);
      this.searchPrices(this.historyProductId);
    }

  }

  createForm() {
    this.productSearch = new FormControl({ value: '', disabled: this.isLoading });
    this.form = new FormGroup({
      productSearch: this.productSearch
    });
  }

  searchPrices(prodToSearch?: string) {
    // console.log('prodToSearch:', prodToSearch);
    let productToSearch = '';
    if (prodToSearch) {
      productToSearch = prodToSearch;
    } else if (this.productSearch.value) {
      this.productSearch.disable();
      productToSearch = this.productSearch.value as string;
    }
    else {
      const warningMsg = new GenericToast(
        'O produto pesquisado não ainda não existe no sistema.',
        'Atenção!', 3000, 'bg-warning text-light');
      this.toastService.show(warningMsg);
      this.productSearch.enable();
      this.productSearch.enable();
      return false;
    }

    const productId = productToSearch
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ /g, '+');

    this.subscriptions.push(
      this.fbs.getSharedCollections<PurchaseItem>('productPurchases', productId, 'lst').subscribe((list) => {
        this.purchaseHistory = list;
        this.prodDataSource = new MatTableDataSource(this.purchaseHistory);
        this.prodDataSource.paginator = this.paginator;
        this.prodDataSource.sort = this.sort;
        this.productSearch.enable();
      }));
  }

  offerToolTip(item: PurchaseItem): string {
    if (item.uOfferPrice) {
      return 'Preço normal: ' + item.uPrice;
    }
    return '';
  }

  removeMe(item: PurchaseItem) {
    // console.log('item: ', item);
    this.removeItem.emit(item);
  }

  showHistory(item: PurchaseItem) {
    const modalRef = this.modalService.open(SearchPopupComponent);
    modalRef.componentInstance.historyProductId = item.name;
  }

  searchProducts = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        if (!this.availableProductNames) {
          return [];
        } else {
          if (term.length < 2) {
            return this.availableProductNames
              .sort((a, b) => (a > b) ? 1 : -1)
              .slice(0, 10);
          } else {
            return this.availableProductNames
              .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
              .sort((a, b) => (a > b) ? 1 : -1)
              .slice(0, 10);
          }
        }
      })
    )
}
