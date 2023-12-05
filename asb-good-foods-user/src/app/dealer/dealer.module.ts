import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealerComponent } from './dealer.component';
import { MaterialModule } from '../common/material/material.module';
import { DealerRoutingModule } from './dealer-routing.module';

@NgModule({
  declarations: [
    DealerComponent
  ],
  imports: [
    CommonModule,
    DealerRoutingModule,
    MaterialModule,
  ],
  exports:[
    DealerComponent
  ]
})
export class DealerModule { }
