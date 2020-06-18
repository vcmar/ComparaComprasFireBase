import { BaseProduct } from './../../models/base-product';
import { AngularFirestore, DocumentReference, CollectionReference } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as firebase from 'firebase';
import { map, take } from 'rxjs/operators';
import { Product } from 'src/app/models/product';


@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {
  public itemFromDB: any;
  public itemBrandArray: any[];
  public itemsSpecificBrand: any;
  public elList: string[] = [];
  public pdrList: any[] = [];

  constructor(
    private fbs: FirebaseService,
    private db: AngularFirestore) { }

  ngOnInit(): void {
    // this.acertarListadeProdutos();
    // this.acertarProdutos();
  }

  listarMarcas() {
    this.db.collection('itens').doc('biscoito+maisena').valueChanges().subscribe((p) => {
      console.log(p);
      this.itemFromDB = p;

      this.itemBrandArray = this.itemFromDB.brands;
      const i = this.itemBrandArray.map((e) => e['brand']).indexOf('fabrica+fortaleza');
      this.itemsSpecificBrand = this.itemBrandArray[i];

    });
  }

  listBrands() {
    // this.db.collection('shared').doc('brands').valueChanges().subscribe((p) => {
    //   console.log(p['lst']);
    //   this.elList = p['lst'];
    // });
    this.fbs.getSharedCollections<string>('shared', 'brands', 'lst').subscribe((p) => {
      this.elList = p;
    });

  }

  listPackages() {
    // this.db.collection('shared').doc('packages').valueChanges().subscribe((p) => {
    //   console.log(p['lst']);
    //   this.elList = p['lst'];
    // });
    this.fbs.getSharedCollections<string>('shared', 'packages', 'lst').subscribe((p) => {
      this.elList = p;
    });
  }

  listProducts() {
    // this.db
    //   .collection('shared')
    //   .doc('products')
    //   .valueChanges()
    //   .subscribe((p) => {
    //     console.log(p['productList']);
    //     this.pdrList = p['productList'];
    //     console.log('this.pdrList = ', this.pdrList);
    //   });

    this.fbs.getSharedCollections<BaseProduct>('shared', 'products', 'productList').subscribe((p) => {
      this.pdrList = p;
    });
  }

  createBrandList() {
    this.db.collection('shared').doc('brands').set({
      lst: ['Rexona', 'Axe', 'Nívea', 'Piracanjuba', 'Molico',
        'Glória', 'Itambe', 'Regina', 'Forno de Minas', 'Piraquê',
        'Seara', 'Bauduco', 'Richeste', 'Primor', 'Sadia', 'Sem Marca',
        'Oetker', 'Elege', 'Nescafé', 'Pilão', 'Yoki', 'União', 'Kibon',
        'Boa Sorte', 'Caldo Carioca', 'Royal', 'Matte Leão', 'Ana Maria',
        'Pinguinos', 'wikibold', 'Lux', 'Toddy', 'Nescau', 'Qualy']
    });

  }

  createPackageList() {
    this.db.collection('shared').doc('packages').set({
      lst: ['Unidades', 'Dúzias', 'Quilos', 'Litros', '50g', '600g', '75g', '200g', '800g', '400g', '70g', '1,5 Litros', '350ml', '500ml']
    });
  }

  createCategoriesList() {
    this.db.collection('shared').doc('categories').set({
      lst: [
        'Biscoitos e Snacks',
        'Congelados',
        'Doces e Sobremesas',
        'Frios e Laticínios',
        'Grãos e Cereais',
        'Higiene e Beleza',
        'Hortifruti',
        'Limpeza',
        'Massas',
        'Pães e Bolos',
        'Matinais']
    });
  }

  searchArrayMap() {
    const prodRef = this.db.collection('itens', ref => ref.where('categoria', '==', 'biscoitos+e+snacks'));
    prodRef.snapshotChanges().subscribe((p) => {
      console.log(p);
    });

    // const prodRef = this.db.collection('shared', ref => ref.where('lst', 'array-contains', 'Rexona'));
    // prodRef.snapshotChanges().subscribe((p) => {
    //   console.log(p);
    // });

    const shRef = this.db.collection('shared').doc('products');
    shRef.snapshotChanges().subscribe((p) => {
      console.log('inner map: ', p);
    });

  }
  testArrayUnion() {
    const docRef = this.db.collection('shared').doc('brands');
    docRef.update({
      lst: firebase.firestore.FieldValue.arrayUnion('Rexona')
    }).then((res) => {
      console.log('res:', res);
    }).catch((err) => {
      console.log('err:', err);
    });
  }

  acertarListadeProdutos() {
    this.fbs.getSharedCollections<Product>('shared', 'products', 'productList').pipe(take(1)).subscribe((p) => {
      const productList = p;
      productList.forEach((e) => {
        this.fbs.addItemToArrayCollection('shared', 'products', {
          brandName: e.brandName,
          category: e.category,
          id: e.id,
          image: e.image,
          name: e.name
        });
      });
    });
  }

  acertarProdutos() {
    this.fbs.getAllItens<Product>('products', 'name').subscribe((p) => {
      const prodList = p;
      prodList.forEach((e) => {
        e.lst.forEach((ee) => {
          this.fbs.addItemToArrayCollection('products', e.id, {
            brand: ee.brand,
            createdBy: ee.createdBy,
            image: ee.image,
            isApproved: ee.isApproved
          });
        });
      });
    });
  }

  acertarPurchaseProducts() {
    this.fbs.getAllItens<Product>('products', 'name').subscribe((p) => {
      const prodList = p;
      prodList.forEach((e) => {
        this.fbs.initializeDocument('productPurchases', e.id, { lst: [] });
      });
    });
  }

  // tslint:disable: no-string-literal
  acertarPrecosDecimal() {
    this.fbs.getAllItens('productPurchases', 'id').subscribe((p) => {
      const prodList = p;
      let counter = 0;
      for (const e of prodList) {
        counter++;
        const newList = [];
        console.log('e[lst]', e['lst']);
        e['lst'].forEach(el => {
          let blPrice = '';
          if (el.billPrice) {
            blPrice = parseFloat('' + el.billPrice).toFixed(2);
          }
          let oOprc = '';
          if (el.uOfferPrice) {
            oOprc = parseFloat('' + el.uOfferPrice).toFixed(2);
          }
          let oDisc = '';
          if (el.offerDiscount) {
            oDisc = parseFloat('' + el.offerDiscount).toFixed(2);
          }
          let uPrc = '';
          if (el.uPrice) {
            uPrc = parseFloat('' + el.uPrice).toFixed(2);
          }
          let oQtd = '';
          if (el.qtd) {
            if (parseFloat('' + el.qtd) < 1) {
              oQtd = parseFloat('' + el.qtd).toFixed(3);
            }
            if (parseFloat('' + el.qtd) % 1 !== 0) {
              oQtd = parseFloat('' + el.qtd).toFixed(3);
            } else {
              oQtd = parseFloat('' + el.qtd).toFixed(0);
            }
          }

          newList.push({
            name: el.name,
            brand: el.brand,
            package: el.package,
            qtd: oQtd,
            uPrice: uPrc,
            billPrice: blPrice,
            offer: el.offer,
            uOfferPrice: oOprc,
            offerDiscount: oDisc,
            date: el.date,
            place: el.place
          });
        });
        console.log('newList', newList);
        this.db.collection('productPurchases').doc(e['id']).set({
          id: e['id'],
          lst: newList
        });
        // if (counter > 2) {
        //   break;
        // }
      }


      // prodList.forEach((e) => {
      //   const newList = [];
      //   console.log('e[lst]', e['lst']);
      //   e['lst'].forEach(el => {
      //     let blPrice = '';
      //     if (el.billPrice) {
      //       blPrice = parseFloat('' + el.billPrice).toFixed(2);
      //     }
      //     let oOprc = '';
      //     if (el.uOfferPrice) {
      //       oOprc = parseFloat('' + el.uOfferPrice).toFixed(2);
      //     }
      //     let oDisc = '';
      //     if (el.offerDiscount) {
      //       oDisc = parseFloat('' + el.offerDiscount).toFixed(2);
      //     }
      //     let uPrc = '';
      //     if (el.uPrice) {
      //       uPrc = parseFloat('' + el.uPrice).toFixed(2);
      //     }
      //     let oQtd = '';
      //     if (el.qtd) {
      //       if (parseFloat('' + el.qtd) < 1) {
      //         oQtd = parseFloat('' + el.qtd).toFixed(3);
      //       }
      //       if (parseFloat('' + el.qtd) % 1 !== 0) {
      //         oQtd = parseFloat('' + el.qtd).toFixed(3);
      //       } else {
      //         oQtd = parseFloat('' + el.qtd).toFixed(0);
      //       }
      //     }

      //     newList.push({
      //       name: el.name,
      //       brand: el.brand,
      //       package: el.package,
      //       qtd: oQtd,
      //       uPrice: uPrc,
      //       billPrice: blPrice,
      //       offer: el.offer,
      //       uOfferPrice: oOprc,
      //       offerDiscount: oDisc,
      //       date: el.date,
      //       place: el.place
      //     });
      //   });
      //   console.log('newList', newList);
      //   // this.db.collection('productPurchases').doc(e['id']).set({
      //   //   id: e['id'],
      //   //   lst: newList
      //   // });
      // });

    });
  }

  // tslint:disable: no-string-literal
  acertarPrecosDecimalNasCompras() {
    this.fbs.getAllItens('purchases', 'date').subscribe((p) => {
      const prodList = p;
      let counter = 0;
      for (const e of prodList) {
        counter++;
        const newList = [];
        // console.log('e: ', e);
        e['lst'].forEach(el => {
          let blPrice = '';
          if (el.billPrice) {
            blPrice = parseFloat(('' + el.billPrice).replace(',', '.')).toFixed(2);
          }
          let oOprc = '';
          if (el.uOfferPrice) {
            oOprc = parseFloat(('' + el.uOfferPrice).replace(',', '.')).toFixed(2);
          }
          let oDisc = '';
          if (el.offerDiscount) {
            oDisc = parseFloat(('' + el.offerDiscount).replace(',', '.')).toFixed(2);
          }
          let uPrc = '';
          if (el.uPrice) {
            uPrc = parseFloat(('' + el.uPrice).replace(',', '.')).toFixed(2);
          }
          let oQtd = '';
          if (el.qtd) {
            if (parseFloat(('' + el.qtd).replace(',', '.')) < 1) {
              oQtd = parseFloat(('' + el.qtd).replace(',', '.')).toFixed(3);
            }
            if (parseFloat(('' + el.qtd).replace(',', '.')) % 1 !== 0) {
              oQtd = parseFloat(('' + el.qtd).replace(',', '.')).toFixed(3);
            } else {
              oQtd = parseFloat(('' + el.qtd).replace(',', '.')).toFixed(0);
            }
          }

          const auxItem = {
            name: el.name,
            brand: el.brand,
            package: el.package,
            qtd: oQtd,
            uPrice: uPrc,
            billPrice: blPrice,
            offer: el.offer,
            uOfferPrice: oOprc,
            offerDiscount: oDisc,
            date: el.date,
            place: el.place
          };

          newList.push(auxItem);

          //   this.fbs
          //     .addItemToArrayCollection(
          //       'productPurchases',
          //       el.name
          //         .toLowerCase()
          //         .trim()
          //         .normalize('NFD')
          //         .replace(/[\u0300-\u036f]/g, '')
          //         .replace(/ /g, '+'),
          //       auxItem);
        });
        console.log('newList: ', {
          id: e['id'],
          date: e['date'],
          createdBy: e['createdBy'],
          place: e['place'],
          lst: newList
        });
        // this.db.collection('purchases').doc(e['id']).set({
        //   id: e['id'],
        //   date: e['date'],
        //   createdBy: e['createdBy'],
        //   place: e['place'],
        //   lst: newList
        // });
      }
    });
  }

}
