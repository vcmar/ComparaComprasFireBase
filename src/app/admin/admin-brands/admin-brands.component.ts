import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BrandFormComponent } from './../../common/brand-form/brand-form.component';
import { FirebaseService } from './../../services/firebase.service';

@Component({
  selector: 'app-admin-brands',
  templateUrl: './admin-brands.component.html',
  styleUrls: ['./admin-brands.component.css']
})
export class AdminBrandsComponent implements OnInit {
  // public brands$: Observable<Brand[]>;
  public brands$: Observable<string[]>;

  constructor(
    private fbs: FirebaseService,
    private modalService: NgbModal) {
    this.brands$ = this.fbs.getSharedCollections<string>('shared', 'brands', 'lst')
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
    modalRef.componentInstance.title = 'Marcas';
  }

}
