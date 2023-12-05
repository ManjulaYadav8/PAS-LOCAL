import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MobaddressComponent } from './mobaddress/mobaddress.component';
import { MobeventsComponent } from './mobevents/mobevents.component';
import { MobordersComponent } from './moborders/moborders.component';
import { MobprofileComponent } from './mobprofile/mobprofile.component';
import { OrderOverviewComponent } from './order-overview/order-overview.component';
import { ProfileComponent } from './profile.component';

const routes: Routes = [
  {path:'',component:ProfileComponent},
  {path:'Orders',component: MobordersComponent},
  {path:'Profile',component:MobprofileComponent},
  {path:'Address', component: MobaddressComponent},
  {path:'Events',component:MobeventsComponent},
  {path:'profile/:docId', component: OrderOverviewComponent},
  {path:':docId', component: OrderOverviewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
