import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

import { AuthService } from './../../services/auth.service';
import { PlacesService } from './../../services/places.service';
import { FirebaseService } from './../../services/firebase.service';
import { AppToastService } from './../../services/app-toast.service';

import { Place } from './../../models/place';
import { GenericToast } from './../../models/generic-toast';
import { AppDuplicatedRecordError } from './../../errors/app-duplicated-record-error';

import { faBackward } from '@fortawesome/free-solid-svg-icons';
import { latLng, tileLayer, Map, LeafletEvent, icon } from 'leaflet';
import * as L from 'leaflet';



@Component({
  selector: 'app-user-places-form',
  templateUrl: './user-places-form.component.html',
  styleUrls: ['./user-places-form.component.css']
})
export class UserPlacesFormComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public form: FormGroup;
  public placeName: FormControl;
  public placeReference: FormControl;
  public placeHasParking: FormControl;
  public placeMap: FormControl;
  public isSaving = false;
  public isEditLoading = false;
  public faBackward = faBackward;
  public options;
  public layersControl;
  public mapInstance: Map;

  private editPlace: Place;
  private editPlaceId: string;
  public alreadyHasMark = false;

  constructor(
    private placesService: PlacesService,
    private authService: AuthService,
    public toastService: AppToastService,
    private route: ActivatedRoute,
    private fbs: FirebaseService) {

    this.editPlaceId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.createForm();
    this.initMap();

    if (this.editPlaceId) {
      this.isEditLoading = true;
      this.subscriptions.push(
        this.fbs.getSingleItem<Place>(this.editPlaceId, 'places').subscribe((p) => {

          this.editPlace = p as Place;
          this.placeName.patchValue(this.editPlace.placeName);
          this.placeReference.patchValue(this.editPlace.placeReference);
          this.placeMap.patchValue(this.editPlace.placeMap);
          this.placeHasParking.patchValue(this.editPlace.placeHasParking);
          this.isEditLoading = false;

          if (this.editPlace.placeMap) {
            const aux = this.editPlace.placeMap.substring(7, this.editPlace.placeMap.length);
            const coords = aux.split(',');
            const myMark = this.setMarker(new L.LatLng(parseFloat(coords[0]), parseFloat(coords[1])));
            myMark.addTo(this.mapInstance);
            this.alreadyHasMark = true;
          }

        }));
    }


  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
    this.toastService.reset();
  }

  createForm() {
    this.placeName = new FormControl('', Validators.required);
    this.placeReference = new FormControl('', Validators.required);

    this.placeHasParking = new FormControl();
    this.placeMap = new FormControl();
    this.form = new FormGroup({
      placeName: this.placeName,
      placeReference: this.placeReference,
      placeHasParking: this.placeHasParking,
      placeMap: this.placeMap
    });
  }

  clearForm() {
    this.form.reset();
    this.isSaving = false;
  }

  savePlace() {
    const srvRef = this.placesService;
    const auxPlace = new Place(
      this.placeName.value,
      this.placeReference.value,
      this.placeHasParking.value,
      this.placeMap.value);
    if (this.editPlaceId) {
      auxPlace.id = this.editPlaceId;
    }
    auxPlace.createdBy = this.authService.currentUser.id;
    auxPlace.isApproved = this.authService.currentUser.isAdmin;
    auxPlace.createdDate = Date.now();

    // Definir fluxo de assinaturas para gravar um novo local!
    let checkUniquePlaceName$ = srvRef.checkUniquePlace(auxPlace.placeName, auxPlace.placeReference);
    if (this.editPlace && (this.editPlace.placeName === this.placeName.value) &&
      (this.editPlace.placeReference === this.placeReference.value)) {
      checkUniquePlaceName$ = of([]);
    }

    const createPlaceTransaction$ = checkUniquePlaceName$.pipe(
      switchMap((checkResult) => {
        if (checkResult.length === 0) {
          return this.fbs.saveOrUpdate<Place>(auxPlace, 'places').pipe(
            switchMap((saveResult) => {
              // Na edição, não precisa gravar relação usuário <-> mercado
              if (this.editPlaceId) {
                return of(true);
              } else {
                return srvRef.saveUserFavorite(this.authService.currentUser.id, saveResult.id);
              }
            })
          );
        }
        else {
          return of(new AppDuplicatedRecordError());
        }
      })
    );

    this.isSaving = true;
    createPlaceTransaction$.subscribe((p) => {
      if (p instanceof AppDuplicatedRecordError) {
        const errorMsg = new GenericToast('Já existe um local com o mesmo nome e referência.', 'Erro', 5000, 'bg-danger text-light');
        this.toastService.show(errorMsg);
        this.isSaving = false;
      } else {
        const successMsg = new GenericToast('Mercado cadastrado com sucesso', null, 5000, 'bg-success text-light');
        this.toastService.show(successMsg);
        this.clearForm();
      }
    });
  }

  initMap() {
    this.options = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; Open Street Map' })
      ],
      zoom: 12,
      center: latLng(-22.9463832, -43.1878663)
    };

    this.layersControl = {
      baseLayers: {
        'Open Street Map': tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
        'Open Cycle Map - Bicicleta': tileLayer('https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=cb6408ff5cf148f4b31ac7ec2aee17eb',
          { maxZoom: 18, attribution: '...' }),
        'Open Transport Map': tileLayer('https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=cb6408ff5cf148f4b31ac7ec2aee17eb',
          { maxZoom: 18, attribution: '...' })
      }
    };
  }
  // tslint:disable: no-string-literal
  mapClick(pointClicked: Map) {
    const latlng = pointClicked['latlng'];
    const myMark = this.setMarker(latlng);

    if (!this.alreadyHasMark) {
      this.alreadyHasMark = !this.alreadyHasMark;
      myMark.addTo(this.mapInstance);
      this.placeMap.setValue('' + latlng);
    }
  }

  setMarker(latlng: L.LatLng): L.Marker {
    const myMark = new L.Marker(latlng, {
      icon: icon({
        iconSize: [ 25, 41 ],
        iconAnchor: [ 13, 41 ],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
     }),
      title: (this.placeName.value as string),
      draggable: true,
      riseOnHover: true
    });
    myMark.addEventListener('moveend', (evento: LeafletEvent) => {
      this.placeMap.setValue(evento.sourceTarget.getLatLng());
    });
    myMark.addEventListener('click', (evento: LeafletEvent) => {
      myMark.removeFrom(this.mapInstance);
      this.placeMap.setValue('');
      this.alreadyHasMark = !this.alreadyHasMark;
    });
    return myMark;
  }


  onMapReady(map: Map) {
    this.mapInstance = map;
  }
}
