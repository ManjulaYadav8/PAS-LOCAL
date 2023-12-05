import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fresh'
})
export class FreshPipe implements PipeTransform {

  transform(values: any[], args: any): any {
    
    if(!values)return null;
        if(!args)return values;

    args = args.toLowerCase();
    return values.filter(function(item){
        return JSON.stringify(item).toLowerCase().includes(args);
    });
  }

}
