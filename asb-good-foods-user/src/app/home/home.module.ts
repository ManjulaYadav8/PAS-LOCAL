import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { HomeRoutingModule } from './home-routing.module';
import { MaterialModule } from '../common/material/material.module';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    CarouselModule,
    HomeRoutingModule,
    MaterialModule
  ],
  exports:[
    HomeComponent,
  ]
})
export class HomeModule { }
