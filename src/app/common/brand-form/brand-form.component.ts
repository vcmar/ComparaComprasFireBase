import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-brand-form',
  templateUrl: './brand-form.component.html',
  styleUrls: ['./brand-form.component.css']
})
export class BrandFormComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() sharedDocName = 'brands';
  @Input() requiredHint = 'Nome de uma nova marca';

  private subscriptions: Subscription[] = [];
  public frmBrand: FormGroup;
  public brandName: FormControl;

  constructor(
    public activeModal: NgbActiveModal,
    private fbs: FirebaseService) {
    this.createForm();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
  }

  createForm() {
    this.brandName = new FormControl('', Validators.required);
    this.frmBrand = new FormGroup({
      brandName: this.brandName
    });
  }

  saveBrand() {
    this.fbs.addItemToArrayCollection('shared', this.sharedDocName, this.brandName.value);
    this.activeModal.close('save');
  }

}
