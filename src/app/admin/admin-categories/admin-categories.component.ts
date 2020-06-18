import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BrandFormComponent } from './../../common/brand-form/brand-form.component';
import { FirebaseService } from './../../services/firebase.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {

  public categories$: Observable<string[]>;

  constructor(
    private fbs: FirebaseService,
    private modalService: NgbModal) {
    this.categories$ = this.fbs.getSharedCollections<string>('shared', 'categories', 'lst')
    .pipe(
      tap(results => {
        results.sort();
      })
    );
  }
  ngOnInit(): void {
  }
  showModal() {
    const modalRef = this.modalService.open(BrandFormComponent);
    modalRef.componentInstance.title = 'Categorias';
    modalRef.componentInstance.sharedDocName = 'categories';
    modalRef.componentInstance.requiredHint = 'Nome de uma nova Categoria';
  }
}
