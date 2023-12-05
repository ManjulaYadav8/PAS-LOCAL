import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxImgZoomModule } from 'ngx-img-zoom';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductOverviewComponent } from './product-overview/product-overview.component';
import { MaterialModule } from '../common/material/material.module';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderModule } from '../default/loader/loader.module';
import { HolidayListModule } from '../default/holiday-list/holiday-list.module';

@NgModule({
    declarations: [
        ProductsComponent,
        ProductListComponent,
        ProductOverviewComponent,
        ReviewCommentsComponent,
        AppointmentComponent,
    ],
    imports: [
        CommonModule,
        ProductsRoutingModule,
        CarouselModule,
        LoaderModule,
        NgxPaginationModule,
        NgxImgZoomModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HolidayListModule,
    ],
    exports: [
        ProductsComponent,
        ProductListComponent,
        ProductOverviewComponent
    ]
})
export class ProductsModule { }
