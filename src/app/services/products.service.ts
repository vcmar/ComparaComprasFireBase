import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Product } from './../models/product';

import { take, map } from 'rxjs/operators';
import { Observable, of, from, concat, zip } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private db: AngularFirestore,
  ) { }

  /**
   * True se nome e marca não existem no banco
   * @param productName Nome do produto
   * @param productBrandId Id da marca do protudo
   */
  checkUniqueness(productName: string, productBrandId: string): Observable<boolean> {
    return this.db.collection<Product>('products',
      ref => ref.where('productName', '==', productName)
        .where('productBrandId', '==', productBrandId)
        .limit(1)).valueChanges().pipe(
          map((result) => {
            if (result.length === 0) {
              return true;
            }
            return false;
          }),
          take(1)
        );
  }
}
