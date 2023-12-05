import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MobaddressComponent } from './mobaddress/mobaddress.component';
import { MobordersComponent } from './moborders/moborders.component';
import { MobprofileComponent } from './mobprofile/mobprofile.component';
import { OrderOverviewComponent } from './order-overview/order-overview.component';
// import { AgmCoreModule } from '@agm/core';
import { FreshPipe } from './fresh.pipe';
import { MaterialModule } from '../common/material/material.module';
import { MobeventsComponent } from './mobevents/mobevents.component';

@NgModule({
  declarations: [
    ProfileComponent,
    MobaddressComponent,
    MobordersComponent,
    MobprofileComponent,
    OrderOverviewComponent,
    FreshPipe,
    MobeventsComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    // AgmCoreModule.forRoot({
    //   apiKey:'AIzaSyBQ8-TyDK9wG5O9YiEyUKGbNQy-Jrd0KFw'
    // }),
  ],
})
export class ProfileModule { }
