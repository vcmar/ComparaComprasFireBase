import { FirebaseService } from 'src/app/services/firebase.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from 'src/app/models/place';
import { Subscription } from 'rxjs';
import { PlacesService } from 'src/app/services/places.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppToastService } from 'src/app/services/app-toast.service';
import { GenericToast } from 'src/app/models/generic-toast';

@Component({
  selector: 'app-admin-places',
  templateUrl: './admin-places.component.html',
  styleUrls: ['./admin-places.component.css']
})
export class AdminPlacesComponent implements OnInit, OnDestroy {
  public isLoading = true;
  public isDeleting = false;
  public isRunningDeleteUpdate = false;
  public placeList: Place[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private authService: AuthService,
    public toastService: AppToastService,
    private fbs: FirebaseService) { }

  ngOnInit(): void {
    this.getAllPlaces();
  }

  getAllPlaces() {
    this.subscriptions.push(
      this.placesService.getPendingPlaces()
        .subscribe((p) => {
          this.placeList = p.map(element => {
            return element;
          })
            .sort((a, b) => (a.placeName > b.placeName) ? 1 : -1);

          this.isLoading = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
    this.toastService.reset();
  }

  editItem(item: Place) {
    this.router.navigate(['user/places/', item.id]);
  }

  approveItem(item: Place) {
    this.isRunningDeleteUpdate = true;

    this.placesService.approvePlace(item).then(() => {
      this.isRunningDeleteUpdate = false;
      this.placeList.splice(this.placeList.indexOf(item), 1);
      const toast = new GenericToast('Mercado foi aprovado e já pode ser utilizado por todos os usuários', 'Sucesso', 5000, 'bg-success text-light');
      this.toastService.show(toast);
    }).catch((error) => {
      console.log(error);
      const toast = new GenericToast('Não foi possível aprovar o mercado. Verifique o log de erro!', 'Erro', 5000, 'bg-error text-light');
      this.toastService.show(toast);
      this.isRunningDeleteUpdate = false;
    });
  }

  showMap(item: Place) {
    const toast = new GenericToast('Função ainda não está disponível', 'Em manutenção', 5000, 'bg-warning text-light');
    this.toastService.show(toast);
  }


  deleteItem(item: Place) {
    this.isDeleting = true;
    this.fbs.deleteItem<Place>(item, 'places')
      .then((result) => {
        const toast = new GenericToast('Local excluído com sucesso', null, 4000, 'bg-warning text-light');
        this.toastService.show(toast);
        this.placeList.splice(this.placeList.indexOf(item), 1);
        this.isDeleting = false;
      })
      .catch((error) => {
        this.isDeleting = false;
      });
  }

}
