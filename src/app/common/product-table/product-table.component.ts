import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { Product } from './../../models/product';

import { FirebaseService } from './../../services/firebase.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product-table',
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.css']
})
export class ProductTableComponent implements OnInit, OnDestroy {
  @Input() deleteEnabled = false;
  @Input() editEnabled = true;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subscriptions: Subscription[] = [];
  public productList: ProdTable[] = [];
  public modalBodyMsg = '';
  public isLoading = true;
  public isDeleting = false;

  public displayedColumns: string[] = ['img', 'name', 'brand', 'category', 'id'];
  public prodDataSource: MatTableDataSource<ProdTable>;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private fbs: FirebaseService) { }

  ngOnInit(): void {
    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(el => {
      el.unsubscribe();
    });
  }

  getAll() {
    const products$ = this.fbs.getSharedCollections<Product>('shared', 'products', 'lst');

    this.subscriptions.push(products$.subscribe((p) => {
      this.productList = p.map(el => {
        return {
          image: el.image,
          name: el.name,
          brand: this.getBrand(el.brandName),
          category: el.category,
          id: el.id
        };
      }).sort((a, b) => (a.name > b.name) ? 1 : -1);
      this.prodDataSource = new MatTableDataSource(this.productList);
      this.prodDataSource.paginator = this.paginator;
      this.prodDataSource.sort = this.sort;
    })
    );
  }

  editItem(item: ProdTable) {
    this.router.navigate(['user/products/', item.id]);
  }

  deleteItem(item: ProdTable, modalDeleteContent) {
    this.modalBodyMsg = item.name + ' - ' + item.brand;
    this.isDeleting = true;

    this.showModal(modalDeleteContent).then(
      (result) => {
        if (result) {
          this.fbs.deleteProductVersion(item.id, item.brand);
        }
        this.isDeleting = false;
      }
    );
  }
  getBrand(brandName: string): string {
    const aux = brandName.split(' - ');
    if (aux.length === 2) {
      return aux[1];
    }
    return '';
  }
  showModal(content): Promise<boolean> {
    return this.modalService.open(content).result.then((result) => {
      if (result) {
        return true;
      }
    }, (reason) => {
      return false;
    });
  }
}
export interface ProdTable {
  image: string;
  name: string;
  brand: string;
  category: string;
  id: string;
}
