import { ProductVersion } from './../models/product-version';
import { AuthUser } from 'src/app/models/auth-user';
import { Injectable } from '@angular/core';
import { Observable, from, zip } from 'rxjs';
import { map, retry, take } from 'rxjs/operators';
import { AngularFirestore, DocumentReference, CollectionReference } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Product } from '../models/product';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
// tslint:disable: no-string-literal
export class FirebaseService {

  constructor(
    private db: AngularFirestore) {
    firebase.firestore().enablePersistence().catch((err) => {
      if (err.code === 'failed-precondition') {
        console.log('failed-precondition');
      } else if (err.code === 'unimplemented') {
        console.log('unimplemented');
      }
    }).finally(() => {
      console.log('Persistence enabled for firebase');
    });
  }


  addProductToSharedCollection(productToSave: Product) {
    this.db.collection('shared').doc('products').update({
      lst: firebase.firestore.FieldValue.arrayUnion({
        id: productToSave.id,
        name: productToSave.name,
        brandName: productToSave.brandName,
        category: productToSave.category,
        image: productToSave.image
      })
    });
  }
  addProductVersion(docId: string, aux: ProductVersion) {
    this.db.collection('products').doc(docId).update({
      lst: firebase.firestore.FieldValue.arrayUnion({
        brand: aux.brand,
        image: aux.image,
        createdBy: aux.createdBy,
        isApproved: aux.isApproved
      })
    });
  }
  addItemToArrayCollection(collectionName: string, docId: string, item: object) {
    this.db.collection(collectionName).doc(docId).update({
      lst: firebase.firestore.FieldValue.arrayUnion(item)
    });
  }

  /**
   * Remove um elemento da collection shared, lista
   * unificada de produtos
   * @param productToRemove Product, objeto que vai ser removido
   */
  removeProductFromSharedCollection(productToRemove: Product) {
    // console.log('removeProductFromSharedCollection Product:', productToRemove);
    this.db.collection('shared').doc('products').update({
      lst: firebase.firestore.FieldValue.arrayRemove({
        id: productToRemove.id,
        name: productToRemove.name,
        brandName: productToRemove.brandName,
        category: productToRemove.category,
        image: productToRemove.image
      })
    });
  }

  removeItemFromArrayCollection(collectionName: string, docId: string, item: object) {
    this.db.collection(collectionName).doc(docId).update({
      lst: firebase.firestore.FieldValue.arrayRemove(item)
    });
  }

  /**
   * Remove a versão ProductVersion do Produto informado
   * @param docId Id do documento na collection products
   * @param aux Objeto ProductVersion que deve ser removido
   * do array versions do produto informado.
   */
  removeProductVersion(docId: string, aux: ProductVersion) {
    // console.log('removeProductVersion aux:', aux);
    this.db.collection('products').doc(docId).update({
      lst: firebase.firestore.FieldValue.arrayRemove({
        brand: aux.brand,
        image: aux.image,
        createdBy: aux.createdBy,
        isApproved: aux.isApproved
      })
    });
  }


  deleteProduct(produto: Product) {
    const brand = produto.brandName.split(' - ')[1];
    let pv: ProductVersion;
    this.getSingleItem<Product>(produto.id, 'products')
      .pipe(take(1))
      .subscribe((p) => {
        // tenho o objeto Produto do banco de dados.
        // Localizar a version correta:
        if (p) {
          p.lst.forEach((el) => {
            if (el.brand === brand) {
              pv = new ProductVersion(el.brand, el.createdBy, el.isApproved, el.image);
            }
          });

          this.removeProductVersion(produto.id, pv);
          this.removeProductFromSharedCollection(produto);
          if (p.lst.length === 1) {
            this.deleteItem<Product>(p, 'products');
          }
        }
      });
  }

  deleteProductVersion(id: string, brand: string) {
    let pv: ProductVersion;
    let pvr: Product;
    this.getSingleItem<Product>(id, 'products')
      .pipe(take(1))
      .subscribe((p) => {
        // tenho o objeto Produto do banco de dados.
        // Localizar a version correta:
        if (p) {
          p.lst.forEach((el) => {
            if (el.brand === brand) {
              pv = new ProductVersion(el.brand, el.createdBy, el.isApproved, el.image);
              pvr = new Product(p.name, p.category);
              pvr.image = el.image;
              pvr.brandName = pvr.name + ' - ' + el.brand;
            }
          });

          this.removeProductVersion(id, pv);
          this.removeProductFromSharedCollection(pvr);
          if (p.lst.length === 1) {
            this.deleteItem<Product>(pvr, 'products');
          }
        }
      });
  }

  getSingleItem<T>(itemId: string, collectionName: string): Observable<T | null> {
    return this.db.collection<T>(collectionName).doc<T>(itemId).snapshotChanges()
      .pipe(
        map((a) => {
          if (a.payload.data()) {
            const aux: T = a.payload.data() as T;
            aux['id'] = itemId;
            return aux;
          }
          return null;
        })
      );
  }
  /**
   *
   * @param collectionName Firebase collection
   * @param sorting field name to asc sort
   */
  getAllItens<T>(collectionName: string, sorting: string): Observable<T[]> {
    return this.db.collection<T>(collectionName, ref => ref.orderBy(sorting, 'asc')).snapshotChanges()
      .pipe(
        map((dcChanges) => {
          return dcChanges.map((doc) => {
            const itemId = doc.payload.doc.id;
            const auxItem = doc.payload.doc.data() as T;
            auxItem['id'] = itemId;
            return auxItem;
          });
        })
      );
  }

  getSharedCollections<T>(collectionName: string, docName: string, listName: string): Observable<T[] | null> {
    return this.db.collection(collectionName).doc(docName).valueChanges().pipe(
      map((p) => {
        if (p) {
          return p[listName];
        }
        return null;
      })
    );
  }
  /**
   *
   * @param collectionName Firebase collection
   * @param fieldToFilter collection string field to filter
   * @param valueToSearch string to search
   */
  getSearchItens<T>(
    collectionName: string,
    fieldToFilter: string,
    valueToSearch: string): Observable<T[]> {

    return this.db
      .collection<T>(
        collectionName,
        ref => ref
          .orderBy(fieldToFilter)
          .startAt(valueToSearch)
          .endAt(valueToSearch + '\uf8ff')
      )
      .snapshotChanges()
      .pipe(
        map((param) => {
          return param.map((doc) => {
            const itemId = doc.payload.doc.id;
            const auxItem = doc.payload.doc.data() as T;
            auxItem['id'] = itemId;
            return auxItem;
          });
        }));
  }


  getMyItens<T>(collectionName: string, uid: string): Observable<T[]> {
    const isApproved = this.db.collection<T>(collectionName, ref => ref.where('isApproved', '==', true))
      .snapshotChanges()
      .pipe(
        map((param) => {
          return param.map((doc) => {
            const itemId = doc.payload.doc.id;
            const auxItem = doc.payload.doc.data() as T;
            auxItem['id'] = itemId;
            return auxItem;
          });
        }));

    const isMyItens = this.db.collection<T>(
      collectionName, ref => ref.where('isApproved', '==', false)
        .where('createdBy', '==', uid)
    )
      .snapshotChanges()
      .pipe(
        map((param) => {
          return param.map((doc) => {
            const itemId = doc.payload.doc.id;
            const auxItem = doc.payload.doc.data() as T;
            auxItem['id'] = itemId;
            return auxItem;

          });
        })
      );

    return zip(isMyItens, isApproved).pipe(
      map(x => x[0].concat(x[1]))
    );
  }

  deleteItem<T>(value: T, collectionName: string): Promise<void> {
    return this.db.collection(collectionName)
      .doc(value['id'])
      .delete();
  }

  initializeDocument(collectionName: string, docId: string, value: object) {
    this.db.collection(collectionName).doc(docId).set({ ...value });
  }

  saveOrUpdate<T>(value: T, collectionName: string): Observable<T | null> {
    // ATENÇÃO: Precisa usar o operador spread (...) para transformar
    // o valor em um tipo Object. Se chamar o objeto instanciado, não funciona!
    let saveOrUpdate$: Observable<DocumentReference | void>;
    if (value['id']) {
      // https://firebase.google.com/docs/firestore/manage-data/add-data
      // To create or overwrite a single document, use the set() method:
      saveOrUpdate$ = from(this.db.collection(collectionName).doc(value['id']).set({ ...value }));
      // saveOrUpdate$ = from(this.db.collection(collectionName).doc(value['id']).update({ ...value }));
    } else {
      // But sometimes there isn't a meaningful ID for the document, and it's more convenient
      // to let Cloud Firestore auto-generate an ID for you. You can do this by calling add():
      saveOrUpdate$ = from(this.db.collection(collectionName).add({ ...value }));
    }


    return saveOrUpdate$.pipe(
      map((s) => {
        // s é void no update.
        if (s) {
          if (s.id) {
            value['id'] = s.id;
            return value;
          } else {
            return null;
          }
        } else {
          // retorna o proprio objeto no update
          return value;
        }
      })
    );
  }
}
