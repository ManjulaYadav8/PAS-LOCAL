import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './cart.component';
import { MaterialModule } from '../common/material/material.module';
import { CouponModule } from '../products/coupon/coupon.module';
import { CarouselModule } from 'ngx-owl-carousel-o';

@NgModule({
  declarations: [
    CartComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    CouponModule,
    CartRoutingModule,
    CarouselModule,
  ]
})
export class CartModule { }
