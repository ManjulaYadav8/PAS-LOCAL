import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentComponent } from './appointment/appointment.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductOverviewComponent } from './product-overview/product-overview.component';
import { ProductsComponent } from './products.component';

const productRoutes: Routes = [
    { path: '', component: ProductListComponent },
    // {path:'', component: ProductsComponent},
    {path:'appointment',component:AppointmentComponent},
    { path: 'products/:list',component: ProductListComponent},
    { path: 'products/:list/:subId', component: ProductListComponent },
    { path: 'products/:list/:subId/:collectionId', component: ProductOverviewComponent },
    {path:':list', component: ProductListComponent},
    {path:':list/:subId', component: ProductListComponent},
    {path:':list/:subId/:collectionId',component: ProductOverviewComponent},
]

@NgModule({
    imports: [RouterModule.forChild(productRoutes)],
    exports: [RouterModule]
  })
  export class ProductsRoutingModule { }

