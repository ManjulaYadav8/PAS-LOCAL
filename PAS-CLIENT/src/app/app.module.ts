import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MobMenuComponent } from './MenuBars/mob-menu/mob-menu.component';
import { DesMenuComponent } from './MenuBars/des-menu/des-menu.component';
import { SalesOrdersComponent } from './sales-orders/sales-orders.component';
import { ItemsComponent } from './items/items.component';
import { CustomersComponent } from './customers/customers.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { CartListComponent } from './cart-list/cart-list.component';
import { AdditemTemplateComponent } from './items/additem-template/additem-template.component';
import { AuthService } from './auth/auth.service';
import { RouteGuardGuard } from './auth/route-guard.guard';
import { DecimalPipe } from '@angular/common';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchaseInvoiceComponent } from './purchase-invoice/purchase-invoice.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    
    MobMenuComponent,
    DesMenuComponent,
    SalesOrdersComponent,
    ItemsComponent,
    CustomersComponent,
    DashboardComponent,
    InvoiceListComponent,
    CartListComponent,
    AdditemTemplateComponent,
    PurchaseOrderComponent,
    PurchaseInvoiceComponent,
    SupplierListComponent,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxPaginationModule,
    ToastrModule.forRoot(),
    
  ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
