import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BrandFormComponent } from './../../common/brand-form/brand-form.component';
import { FirebaseService } from './../../services/firebase.service';


@Component({
  selector: 'app-admin-packages',
  templateUrl: './admin-packages.component.html',
  styleUrls: ['./admin-packages.component.css']
})
export class AdminPackagesComponent implements OnInit {
  public packages$: Observable<string[]>;

  constructor(
    private fbs: FirebaseService,
    private modalService: NgbModal) {
    this.packages$ = this.fbs.getSharedCollections<string>('shared', 'packages', 'lst')
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
    modalRef.componentInstance.title = 'Embalagens';
    modalRef.componentInstance.sharedDocName = 'packages';
    modalRef.componentInstance.requiredHint = 'Nome de uma nova embalagem';
  }
}
