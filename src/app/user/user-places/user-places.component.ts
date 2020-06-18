import { FirebaseService } from 'src/app/services/firebase.service';
import { GenericToast } from './../../models/generic-toast';
import { AppToastService } from './../../services/app-toast.service';
import { Place } from './../../models/place';
import { PlacesService } from './../../services/places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable, pipe } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/internal/operators/map';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-user-places',
  templateUrl: './user-places.component.html',
  styleUrls: ['./user-places.component.css']
})
export class UserPlacesComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public places$: Observable<Place[]>;

  public placeList: Place[] = [];
  public isLoading = true;
  public isDeleting = false;

  modalBodyMsg = '';


  constructor(
    private router: Router,
    private authService: AuthService,
    public toastService: AppToastService,
    private modalService: NgbModal,
    private fbs: FirebaseService) { }

  ngOnInit(): void {
    this.getAllPlaces();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      element.unsubscribe();
    });
    this.toastService.reset();
  }
  getAllPlaces() {
    this.places$ = this.fbs.getMyItens<Place>('places', this.authService.currentUser.id);
    //  this.placesService.getMyPlaces(this.authService.currentUser.id);

    this.subscriptions.push(this.places$.subscribe((p) => {
      this.placeList = p.map(element => {
        return element;
      })
        .sort((a, b) => (a.placeName > b.placeName) ? 1 : -1);

      this.isLoading = false;
    })
    );
  }

  editItem(item: Place) {
    if ((item.createdBy === this.authService.currentUser.id) || (this.authService.currentUser.isAdmin)) {
      this.router.navigate(['user/places/', item.id]);
    } else {
      const toast = new GenericToast('Você não tem permissão para editar o local selecionado', null, 5000, 'bg-danger text-light');
      this.toastService.show(toast);

    }
  }
  showMap(item: Place) {
    const toast = new GenericToast('Função ainda não está disponível', 'Em manutenção', 5000, 'bg-warning text-light');
    this.toastService.show(toast);
  }

  deleteItem(item: Place, modalContent) {
    if (item.isApproved && !this.authService.currentUser.isAdmin) {
      const toast = new GenericToast('O local já foi aprovado. Somente um administrador poderá excluí-lo', 'Alerta!', 4000, 'bg-warning text-light');
      this.toastService.show(toast);
      return;
    }

    this.modalBodyMsg = item.placeName + ' - ' + item.placeReference;
    this.isDeleting = true;

    this.showModal(modalContent).then(
      (result) => {
        if (result) {
          // this.placesService
          //   .delete(item)
          this.fbs.deleteItem<Place>(item, 'places')
            .then((r) => {
              const toast = new GenericToast('Local excluído com sucesso', null, 4000, 'bg-warning text-light');
              this.toastService.show(toast);
              this.placeList.splice(this.placeList.indexOf(item), 1);
              this.isDeleting = false;
            })
            .catch((error) => {
              this.isDeleting = false;
            });
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'Usou ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'Clicou fora do modal';
    } else {
      return `with: ${reason}`;
    }
  }

}
