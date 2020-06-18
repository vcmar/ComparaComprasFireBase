import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolean'
})
export class BooleanPipe implements PipeTransform {

  transform(value: boolean, verdadeiro?: string, falso?: string): string {
    const positiveResult = (verdadeiro) ? verdadeiro : 'true';
    const negativeResult = (falso) ? falso : 'false';
    if (value) {
      return positiveResult;
    }
    return negativeResult;
  }

}
