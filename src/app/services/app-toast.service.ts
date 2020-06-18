import { GenericToast } from './../models/generic-toast';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppToastService {
  toasts: GenericToast[] = [];
  constructor() { }

  show(toast: GenericToast) {
    this.toasts.push(toast);
  }
  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
  reset() {
    this.toasts = [];
  }
}
