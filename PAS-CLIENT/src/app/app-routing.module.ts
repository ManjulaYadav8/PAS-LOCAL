import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartListComponent } from './cart-list/cart-list.component';
import { CustomersComponent } from './customers/customers.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { AdditemTemplateComponent } from './items/additem-template/additem-template.component';
import { ItemsComponent } from './items/items.component';
import { LoginComponent } from './login/login.component';
import { SalesOrdersComponent } from './sales-orders/sales-orders.component';
import { RouteGuardGuard } from './auth/route-guard.guard';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchaseInvoiceComponent } from './purchase-invoice/purchase-invoice.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';

const routes: Routes = [

  {path:"",redirectTo:'dashboard', pathMatch:'full'},

  {path:'login', component:LoginComponent},
  {path:'dashboard', component:DashboardComponent },
  {path:'items', component:ItemsComponent},
  {path:'salesorder', component:SalesOrdersComponent},
  {path:'invoices', component:InvoiceListComponent},
  {path:'customers', component:CustomersComponent},
  {path:'cartlist', component:CartListComponent},
  {path:'addnewitem', component:AdditemTemplateComponent},
  {path:'purchase_order', component:PurchaseOrderComponent},
  {path:'purchase_invoice', component:PurchaseInvoiceComponent},
  {path:'suppliers', component:SupplierListComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
