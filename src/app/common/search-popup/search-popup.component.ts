import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.css']
})
export class SearchPopupComponent implements OnInit {
  @Input() historyProductId: string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
