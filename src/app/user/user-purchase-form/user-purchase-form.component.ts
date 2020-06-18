import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable, of, from, zip, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError, take, filter, merge } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { faBackward, faCalendarAlt, faTrashAlt, faFolderPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { PurchaseItem } from './../../models/purchase-item';
import { Product } from './../../models/product';
import { Place } from './../../models/place';
import { Purchase } from './../../models/purchase';

import { FirebaseService } from './../../services/firebase.service';
import { AuthService } from './../../services/auth.service';
import { AppToastService } from './../../services/app-toast.service';

@Component({
  selector: 'app-user-purchase-form',
  templateUrl: './user-purchase-form.component.html',
  styleUrls: ['./user-purchase-form.component.css']
})
export class UserPurchaseFormComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  public faBackward = faBackward;
  public faCalendarAlt = faCalendarAlt;
  public faTrashAlt = faTrashAlt;
  public faFolderPlus = faFolderPlus;
  public faInfoCircle = faInfoCircle;

  public form: FormGroup;
  public purchasePlace: FormControl;
  public purchaseDate: FormControl;
  public purchaseProduct: FormControl;
  public purchasePackage: FormControl;
  public purchaseQtd: FormControl;
  public purchaseUnitValue: FormControl;
  public purchaseBillingValue: FormControl;
  public purchaseHasOffer: FormControl;
  public purchaseOfferType: FormControl;
  public purchaseChargedQtd: FormControl;
  public purchaseOfferUnitValue: FormControl;
  public purchaseOfferDiscountValue: FormControl;
  public purchaseApplyOfferType: FormControl;


  @ViewChild('modalDeleteContent')
  private modalDeleteContent: TemplateRef<any>;
  public modalBodyMsg: string;

  public availablePlaces: Place[];
  public availableProductNames: string[];
  public availableProducts: Product[];
  public availablePackages: string[];
  public isLoading = true;
  public isSaving = false;
  public isDeleting = false;

  public purchaseListItens: PurchaseItem[] = []; // Vai ser substituido pelo subject abaixo
  public prodsFromPurchase: Subject<PurchaseItem[]> = new Subject();

  public currentPurchase: Purchase;

  public editPurchaseId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fbs: FirebaseService,
    private authService: AuthService,
    private toastService: AppToastService,
    private modalService: NgbModal) {
    this.createForm();

    this.editPurchaseId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {

    const a$ = this.fbs.getAllItens<Place>('places', 'placeName');
    const b$ = this.fbs.getSharedCollections<string>('shared', 'packages', 'lst');
    const c$ = this.fbs.getSharedCollections<Product>('shared', 'products', 'lst');
    zip(a$, b$, c$).subscribe((x) => {
      this.availablePlaces = x[0];
      this.availablePackages = x[1];
      this.availableProducts = x[2];

      // Gera erro quando o firebase não retorna algum valor
      // console.log('this.availableProducts: ', this.availableProducts);
      this.availableProductNames = [...new Set(x[2].map((p) => p.brandName))];
      this.isLoading = false;
    });

    if (this.editPurchaseId) {
      this.isLoading = true;

      // Edição não deve aceitar trocar a data e mercado
      this.purchaseDate.disable();
      this.purchasePlace.disable();

      this.fbs.getSingleItem<Purchase>(this.editPurchaseId, 'purchases')
        .pipe(take(1))
        .subscribe((p) => {
          if (p) {
            const purchaseDate = new Date(p.date);
            const dateModel = { year: purchaseDate.getFullYear(), month: purchaseDate.getMonth() + 1, day: purchaseDate.getDate() };
            this.currentPurchase = p;
            this.purchaseDate.setValue(dateModel);
            this.purchasePlace.setValue(p.place);
            this.currentPurchase.lst.forEach((el) => {
              this.purchaseListItens.push(el);
              // Emite a cada alteração... não gostei muito
              this.prodsFromPurchase.next(this.purchaseListItens);
            });
          } else {
            console.log('Falha ao recuperar dados de sua compra. Tente novamente.');
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
    // this.toastService.reset();
  }

  createForm() {
    this.purchasePlace = new FormControl('', Validators.required);
    this.purchaseDate = new FormControl('', Validators.required);
    this.purchaseProduct = new FormControl('', Validators.required);
    this.purchasePackage = new FormControl('', Validators.required);
    this.purchaseQtd = new FormControl('', [Validators.required, Validators.pattern(/^\d*[\.|,]{0,1}\d{0,3}$/)]);
    this.purchaseUnitValue = new FormControl('', [Validators.required, Validators.pattern(/^\d*[\.|,]{0,1}\d{0,3}$/)]);
    this.purchaseBillingValue = new FormControl('', Validators.required);
    this.purchaseHasOffer = new FormControl('');
    this.purchaseOfferType = new FormControl('');
    this.purchaseOfferUnitValue = new FormControl('', Validators.pattern(/^\d*[\.|,]{0,1}\d{0,3}$/));
    this.purchaseApplyOfferType = new FormControl('');
    this.purchaseOfferDiscountValue = new FormControl('', Validators.pattern(/^\d*[\.|,]{0,1}\d{0,3}$/));

    this.form = new FormGroup({
      purchasePlace: this.purchasePlace,
      purchaseDate: this.purchaseDate,
      purchaseProduct: this.purchaseProduct,
      purchasePackage: this.purchasePackage,
      purchaseQtd: this.purchaseQtd,
      purchaseUnitValue: this.purchaseUnitValue,
      purchaseBillingValue: this.purchaseBillingValue,
      purchaseHasOffer: this.purchaseHasOffer,
      purchaseOfferType: this.purchaseOfferType,
      purchaseOfferUnitValue: this.purchaseOfferUnitValue,
      purchaseApplyOfferType: this.purchaseApplyOfferType,
      purchaseOfferDiscountValue: this.purchaseOfferDiscountValue
    });
    this.purchaseBillingValue.disable();
  }

  enableOffer() {
    if (this.purchaseHasOffer.value) {
      this.purchaseApplyOfferType.reset();
    } else {

    }
  }

  changeOfferType(opt: number) {
    this.purchaseUnitValue.disable();
    if (opt === 1) {
      this.purchaseOfferUnitValue.enable();
      this.purchaseOfferDiscountValue.disable();
    } else {
      this.purchaseOfferUnitValue.disable();
      this.purchaseOfferDiscountValue.enable();
      this.purchaseUnitValue.enable();
    }
  }

  calculateOferPrice() {
    if ((this.purchaseQtd.touched) &&
      (this.purchaseQtd.valid) &&
      (this.purchaseUnitValue.touched) &&
      (this.purchaseUnitValue.valid || this.purchaseUnitValue.disabled)
    ) {
      const auxQtd = Number((this.purchaseQtd.value as string).replace(',', '.'));

      // this.purchaseQtd.setValue(auxQtd);
      if (
        (this.purchaseApplyOfferType.value === '1') &&
        (this.purchaseOfferUnitValue.touched) &&
        (this.purchaseOfferUnitValue.valid)
      ) {
        const auxValue = Number((this.purchaseOfferUnitValue.value as string).replace(',', '.'));
        // this.purchaseOfferUnitValue.setValue(auxValue);
        this.purchaseBillingValue.setValue((auxQtd * auxValue).toFixed(2));
      }
      if (
        (this.purchaseApplyOfferType.value === '2') &&
        (this.purchaseOfferDiscountValue.touched) &&
        (this.purchaseOfferDiscountValue.valid)
      ) {
        const auxDiscount = Number((this.purchaseOfferDiscountValue.value as string).replace(',', '.'));
        const auxOriginalValue = Number((this.purchaseBillingValue.value as string).replace(',', '.'));
        this.purchaseOfferUnitValue.setValue(((auxOriginalValue - auxDiscount) / auxQtd).toFixed(2));
      }
    }
  }

  calculateTotalPrice() {
    if ((this.purchaseQtd.touched) &&
      (this.purchaseQtd.valid) &&
      (this.purchaseUnitValue.touched) &&
      (this.purchaseUnitValue.valid)
    ) {
      const auxQtd = Number((this.purchaseQtd.value as string).replace(',', '.'));
      const auxValue = Number((this.purchaseUnitValue.value as string).replace(',', '.'));
      this.purchaseBillingValue.setValue((auxQtd * auxValue).toFixed(2));
      // this.purchaseQtd.setValue(auxQtd);
      // this.purchaseUnitValue.setValue(auxValue);
      this.purchaseBillingValue.disable();
    }
  }

  // tslint:disable: no-string-literal
  addItemToList(): boolean {
    this.isSaving = true;
    const purchaseDate = new Date(
      this.purchaseDate.value['year'],
      this.purchaseDate.value['month'] - 1,
      this.purchaseDate.value['day']
    );

    const aux: PurchaseItem = new PurchaseItem();
    aux.name = (this.purchaseProduct.value as string)
      .split(' - ')[0];
    aux.brand = (this.purchaseProduct.value as string)
      .split(' - ')[1];
    aux.id = aux.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ /g, '+');
    const auxQtd = Number((this.purchaseQtd.value as string).replace(',', '.'));
    const auxUPrice = Number((this.purchaseUnitValue.value as string).replace(',', '.'));
    const auxUOfferPrice = Number((this.purchaseOfferUnitValue.value as string).replace(',', '.'));
    const auxDiscount = Number((this.purchaseOfferDiscountValue.value as string).replace(',', '.'));
    aux.package = this.purchasePackage.value;
    aux.qtd = auxQtd; // this.purchaseQtd.value;
    aux.uPrice = auxUPrice; // this.purchaseUnitValue.value;
    aux.billPrice = this.purchaseBillingValue.value;
    aux.offer = this.purchaseOfferType.value;
    aux.uOfferPrice = auxUOfferPrice; // this.purchaseOfferUnitValue.value;
    aux.offerDiscount = auxDiscount; // this.purchaseOfferDiscountValue.value;
    aux.date = purchaseDate.getTime();
    aux.place = this.purchasePlace.value;

    // Firebase só aceita object dentro dos arrays.
    const prodOccurrence = {
      name: aux.name,
      brand: aux.brand,
      package: aux.package,
      qtd: aux.qtd,
      uPrice: aux.uPrice,
      billPrice: aux.billPrice,
      offer: aux.offer,
      uOfferPrice: aux.uOfferPrice,
      offerDiscount: aux.offerDiscount,
      date: aux.date,
      place: aux.place
    };

    // Estamos adicionando um item pela primeira vez. Compra ainda não foi criada
    if (!this.currentPurchase) {
      this.currentPurchase = new Purchase(this.purchasePlace.value, this.authService.currentUser.id, purchaseDate.getTime());
      this.currentPurchase.createdBy = this.authService.currentUser.id;
      this.fbs.saveOrUpdate<Purchase>(this.currentPurchase, 'purchases').subscribe((p => {
        if (p) {
          this.currentPurchase.id = p.id;
          this.fbs.addItemToArrayCollection('purchases', p.id, prodOccurrence);
        }
      }));
    } else {
      // Compra já existe. Adicionar mais produtos
      this.fbs.addItemToArrayCollection('purchases', this.currentPurchase.id, prodOccurrence);
    }
    this.purchaseDate.disable();
    this.purchasePlace.disable();

    this.fbs.addItemToArrayCollection('productPurchases', aux.id, prodOccurrence);
    this.purchaseListItens.push(aux);
    // Emite nova lista ao adicionar produto
    this.prodsFromPurchase.next(this.purchaseListItens);
    this.clearProductForm();
    this.isSaving = false;
    return true;
  }

  removeMe(item: PurchaseItem) {
    item.id = item.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ /g, '+');
    this.modalBodyMsg = item.name + ' - ' + item.brand;
    const prodOccurrence = {
      name: item.name,
      brand: item.brand,
      package: item.package,
      qtd: item.qtd,
      uPrice: item.uPrice,
      billPrice: item.billPrice,
      offer: item.offer,
      uOfferPrice: item.uOfferPrice,
      offerDiscount: item.offerDiscount,
      date: item.date,
      place: item.place
    };
    this.isDeleting = true;

    this.showModal(this.modalDeleteContent)
      .then(
        (result) => {
          if (result) {
            this.purchaseListItens.splice(this.purchaseListItens.indexOf(item), 1);
            // Emite nova lista ao adicionar produto
            this.prodsFromPurchase.next(this.purchaseListItens);
            this.fbs.removeItemFromArrayCollection('purchases', this.currentPurchase.id, prodOccurrence);
            this.fbs.removeItemFromArrayCollection('productPurchases', item.id, prodOccurrence);
          }
          this.isDeleting = false;
        });
  }

  clearProductForm() {
    this.purchaseProduct.reset();
    this.purchasePackage.reset();
    this.purchaseQtd.reset();
    this.purchaseUnitValue.reset();
    this.purchaseBillingValue.reset();
    this.purchaseHasOffer.reset();
    this.purchaseOfferType.reset();
    this.purchaseOfferUnitValue.reset();
    this.purchaseOfferUnitValue.setValue('');
    this.purchaseOfferDiscountValue.reset();
    this.purchaseOfferDiscountValue.setValue('');
    this.purchaseApplyOfferType.reset();
  }

  ShowNewProductForm() {
    // const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    // this.router.navigate([returnUrl || '/user/dashboard']);
    this.router.navigate(['/user/products/new'], { queryParams: { returnUrl: this.editPurchaseId } });
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

  searchPlaces = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        if (!this.availablePlaces) {
          return [];
        } else {
          if (term.length < 2) {
            return this.availablePlaces
              .map(el => el.placeName + ' - ' + el.placeReference)
              .sort((a, b) => (a > b) ? 1 : -1)
              .slice(0, 10);
          } else {
            return this.availablePlaces
              .map(el => el.placeName + ' - ' + el.placeReference)
              .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
              .sort((a, b) => (a > b) ? 1 : -1)
              .slice(0, 10);
          }
        }
      })
    )

  searchPackages = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        if (!this.availablePackages) {
          return [];
        } else {
          if (term.length < 1) {
            return this.availablePackages
              .sort((a, b) => (a > b) ? 1 : -1)
              .slice(0, 10);
          } else {
            return this.availablePackages
              .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
              .sort((a, b) => (a > b) ? 1 : -1)
              .slice(0, 10);
          }
        }
      })
    )

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

