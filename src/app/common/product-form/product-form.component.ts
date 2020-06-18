import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { of, Observable, Subscription, interval, pipe, from, zip } from 'rxjs';
import { map, retry, switchMap, take, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { faBackward } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from './../../services/auth.service';
import { FirebaseService } from './../../services/firebase.service';
import { AppToastService } from './../../services/app-toast.service';
import { GenericToast } from './../../models/generic-toast';
import { ProductVersion } from './../../models/product-version';
import { Product } from './../../models/product';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BrandFormComponent } from '../brand-form/brand-form.component';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy  {
  private subscriptions: Subscription[] = [];
  public isSaving = false;
  public isEditLoading = false;
  public faBackward = faBackward;

  public form: FormGroup;
  public productName: FormControl;
  public productBrand: FormControl;
  public productCategory: FormControl;
  public productImage: FormControl;

  public productList: string[];
  public categoryList: string[];
  public brandList: string[];

  public indexOfEditMode: number;
  public productToEdit: Product;

  @ViewChild('modalDeleteContent')
  private modalDeleteContent: TemplateRef<any>;
  public modalBodyMsg: string;
  public isDeleting = false;

  public firstProductSave = true;

  // Cards versões do produto
  public productVersions: ProductVersion[];

  public editProductId: string;

  public isAdminMode: boolean;

  constructor(
    private toastService: AppToastService,
    private authService: AuthService,
    private modalService: NgbModal,
    private fbs: FirebaseService,
    private route: ActivatedRoute
  ) {
    this.editProductId = this.route.snapshot.paramMap.get('id');
    this.isAdminMode = authService.currentUser.isAdmin;
    console.log('ProductFormComponent.constructor');
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.fbs.getSharedCollections<string>('shared', 'brands', 'lst').subscribe((p) => {
        this.brandList = p;
      })
    );

    this.subscriptions.push(
      this.fbs.getSharedCollections<string>('shared', 'categories', 'lst').pipe(take(1)).subscribe((p) => {
        this.categoryList = p;
      })
    );

    this.subscriptions.push(
      this.fbs.getSharedCollections<Product>('shared', 'products', 'lst').pipe(take(1)).subscribe((p) => {
        // Aplicar um distinct no nome do produto!
        this.productList = [...new Set(p.map((el) => {
          return el.name;
        }))];
      })
    );


    this.createForm();
    this.productVersions = [];
    this.indexOfEditMode = -1;

    if (this.editProductId) {
      this.isEditLoading = true;
      this.getProductData(this.editProductId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
    this.toastService.reset();
  }

  createForm() {
    this.productName = new FormControl('', Validators.required);
    this.productBrand = new FormControl('', Validators.required);
    this.productCategory = new FormControl('', Validators.required);
    this.productImage = new FormControl('');
    this.form = new FormGroup({
      productName: this.productName,
      productBrand: this.productBrand,
      productCategory: this.productCategory,
      productImage: this.productImage,
    });
  }

  clearForm() {
    this.form.reset();
    this.isSaving = false;
    this.productVersions = [];
    this.firstProductSave = true;
    this.indexOfEditMode = -1;
  }

  CheckProductExists() {
    // console.log('this.productName.pristine: ', this.productName.pristine);
    if (this.productName.touched &&
      this.productName.valid &&
      !this.productName.pristine) {

      const productId = (this.productName.value as string)
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ /g, '+');

      // console.log('chave candidata do produto: ', productId);

      this.isEditLoading = true;
      this.productVersions = [];
      this.getProductData(productId);
    }
  }

  getProductData(productId: string) {
    this.subscriptions.push(
      this.fbs.getSingleItem<Product>(productId, 'products').pipe(take(1)).subscribe((produto) => {
        if (produto) {
          // console.log('produto localizado: ', produto);

          const startEditMsg = new GenericToast(
            'Iniciando modo de edição para o item: ' + produto.name,
            'Produto localizado', 4000, 'bg-info text-light');
          this.toastService.show(startEditMsg);

          this.productName.setValue(produto.name);
          this.productCategory.setValue(produto.category);
          this.productVersions = [...produto.lst];

          this.productBrand.reset();
          this.productImage.reset();
          this.productToEdit = produto;
          this.firstProductSave = false;
        } else {
          // Limpar o produto para edição caso um novo nome seja informado
          this.productToEdit = null;
          this.indexOfEditMode = -1;
          this.firstProductSave = true;
        }
        this.isEditLoading = false;

        // Para evitar que o blur() do controle dispare uma nova consulta
        this.productName.markAsPristine();
      })
    );
  }

  addVersion() {
    if (this.form.invalid) {
      const warningMsg = new GenericToast(
        'Verifique se todos os campos obrigatórios estão preenchidos antes de prosseguir.',
        'Atenção!', 4000, 'bg-warning text-light');
      this.toastService.show(warningMsg);
      return;
    }
    const productToSave = new Product(this.productName.value, this.productCategory.value);
    if (this.firstProductSave) {
      this.firstProductSave = !this.firstProductSave;
      this.fbs.saveOrUpdate<Product>(productToSave, 'products');

      // INICIALIZA A LISTAGEM DE OCORRÊNCIAS DO PRODUTO
      this.fbs.saveOrUpdate<object>({ id: productToSave.id }, 'productPurchases');
    }

    const aux = new ProductVersion(
      this.productBrand.value,
      this.authService.currentUser.id,
      this.authService.currentUser.isAdmin,
      this.productImage.value);


    // If we are doing an edit operation:
    if (this.indexOfEditMode > -1) {
      productToSave.brandName = productToSave.name + ' - ' + this.productVersions[this.indexOfEditMode].brand;
      productToSave.image = this.productVersions[this.indexOfEditMode].image;
      this.fbs.removeProductVersion(this.productToEdit.id, this.productVersions[this.indexOfEditMode]);
      this.fbs.removeProductFromSharedCollection(productToSave);
    }

    this.fbs.addProductVersion(productToSave.id, aux);
    productToSave.brandName = productToSave.name + ' - ' + aux.brand;
    productToSave.image = this.productImage.value;
    this.fbs.addProductToSharedCollection(productToSave);

    if (this.indexOfEditMode > -1) {
      this.productVersions.splice(this.indexOfEditMode, 1, aux);
    } else {
      this.productVersions.push(aux);
    }

    this.productBrand.reset();
    this.productImage.reset();
    this.indexOfEditMode = -1;

    const startEditMsg = new GenericToast(
      'Produto foi cadastrado com sucesso',
      'Sucesso', 4000, 'bg-success text-light');
    this.toastService.show(startEditMsg);
  }

  /**
   * Evento disparado do card de produtos para editar item
   * @param item Produto
   * @param index Posição na lista
   */
  editItem(item: ProductVersion, index: number) {
    this.productImage.setValue(item.image);
    this.productBrand.setValue(item.brand);
    this.indexOfEditMode = index;
  }

  /**
   * Evento disparado pelo card de produtos para excluir item
   * @param item Produto
   * @param index Posição na lista
   */
  deleteItem(item: ProductVersion, index: number) {
    this.modalBodyMsg = this.productName.value + ' da marca ' + item.brand;
    this.isDeleting = true;
    this.productToEdit.brandName = this.productToEdit.name + ' - ' + item.brand;
    this.productToEdit.image = item.image;
    this.showModal(this.modalDeleteContent).then(
      (result) => {
        if (result) {
          this.fbs.removeProductVersion(this.productToEdit.id, this.productVersions[index]);
          this.fbs.removeProductFromSharedCollection(this.productToEdit);

          this.productVersions.splice(this.indexOfEditMode, 1);
          this.isDeleting = false;
        } else {
          this.isDeleting = false;
        }
      }
    );
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

  searchCategories = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? this.categoryList
        .sort((a, b) => (a > b) ? 1 : -1)
        .slice(0, 10)
        : this.categoryList
          .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .sort((a, b) => (a > b) ? 1 : -1)
          .slice(0, 10)
      )
    )

  searchBrands = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? this.brandList
        .sort((a, b) => (a > b) ? 1 : -1)
        .slice(0, 10)
        : this.brandList
          .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .sort((a, b) => (a > b) ? 1 : -1)
          .slice(0, 10)
      )
    )

  searchProducts = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        if (term.length < 2) {
          return [];
        } else {
          if (!this.productList) {
            return [];
          }
          return this.productList
            .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .sort((a, b) => (a > b) ? 1 : -1)
            .slice(0, 10);
        }
      })
    )

  // Dispara a pesquisa quando um TypeAhead é selecionado
  selectedProduct(element) {
    // tslint:disable-next-line: no-string-literal
    this.productName.setValue(element['item']);
    this.productName.markAllAsTouched();
    this.CheckProductExists();
  }

  showNewBrandModal() {
    const modalRef = this.modalService.open(BrandFormComponent);
    modalRef.componentInstance.title = 'Marcas';
  }
}
