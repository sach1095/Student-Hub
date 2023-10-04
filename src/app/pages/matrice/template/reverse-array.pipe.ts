import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverseArray',
})
export class ReverseArrayPipe implements PipeTransform {
  transform(array: any[]): any[] {
    return array.slice().reverse();
  }
}
