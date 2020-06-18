import { Category } from 'src/app/models/category';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Brand } from 'src/app/models/brand';
import { faCameraRetro, faBackward, faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit {
  @Input() name: string;
  @Input() brand: string;
  @Input() category: string;
  @Input() image: string;
  @Input() isEditable: boolean;

  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();

  public faCamera = faCameraRetro;
  public faTrash = faTrash;
  public faBackward = faBackward;
  public faPencilAlt = faPencilAlt;

  constructor() { }

  ngOnInit(): void {

  }

  removeMe() {
    this.delete.emit();
  }

  editMe() {
    this.edit.emit();
  }
}
