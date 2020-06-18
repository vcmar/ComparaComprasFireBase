import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore/interfaces';
import { Place } from '../models/place';
import { firestore } from 'firebase';
import { take, map } from 'rxjs/operators';
import { Observable, from, concat, zip } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {


  constructor(
    private db: AngularFirestore,
    private authService: AuthService) { }

  /**
   * Verifica se a combinação nome_referencia já foi cadastrada
   * retorna um array vazio caso não encontre referência
   * @param placeName Nome do Local
   * @param placeReference Referencia para local
   */
  checkUniquePlace(placeName: string, placeReference: string): Observable<Place[]> {
    return this.db.collection<Place>('places',
      ref => ref.where('placeName', '==', placeName)
        .where('placeReference', '==', placeReference)
        .limit(1)).valueChanges().pipe(
          take(1)
        );
  }

  saveUserFavorite(uid: string, place: string) {
    const favoritePlace = { userUid: uid, placeId: place };
    const saveUserFavorite$ = from(this.db.collection('userPlaces').add(favoritePlace));
    // Atenção: nesse ponto, o add já foi executado no firebase
    return saveUserFavorite$.pipe(
      map((r) => {
        if (r.id) {
          console.log('id da relação favoritePlace = ', r.id);
          return true;
        }
        else {
          return false;
        }
      })
    );
  }

  /**
   * Função administrativa, retorna locais pendentes
   * de uma aprovação
   */
  getPendingPlaces(): Observable<Place[]> {
    const isMarketPending = this.db.collection<Place>('places', ref => ref.where('isApproved', '==', false))
      .snapshotChanges()
      .pipe(
        map((param) => {
          return param.map((doc) => {
            const placeId = doc.payload.doc.id;
            const auxPlace = doc.payload.doc.data() as Place;
            auxPlace.id = placeId;
            return auxPlace;
          });
        }));
    return isMarketPending;
  }

  approvePlace(item: Place) {
    return this.db.collection('places').doc(item.id).update({ isApproved: true });
  }
}
