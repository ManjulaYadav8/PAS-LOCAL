import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PrivacyPolicyComponent } from './business-document/privacy-policy/privacy-policy.component';
import {ToastrModule} from 'ngx-toastr';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { TermsConditionsComponent } from './business-document/terms-conditions/terms-conditions.component';
import { DisclaimerComponent } from './business-document/disclaimer/disclaimer.component';
import { ShippingReturnComponent } from './business-document/shipping-return/shipping-return.component';
import { MaterialModule } from './common/material/material.module';
import { ForgotPasswordComponent } from './default/authentication/forgot-password/forgot-password.component';
import { LoginComponent } from './default/authentication/login/login.component';
import { SignUpComponent } from './default/authentication/sign-up/sign-up.component';
import { BackToTopComponent } from './default/back-to-top/back-to-top.component';
import { FooterComponent } from './default/footer/footer.component';
import { HeaderComponent } from './default/header/header.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { ChatBoxComponent } from './default/chat-box/chat-box.component';
import { LoaderModule } from './default/loader/loader.module';
import { HolidayListModule } from './default/holiday-list/holiday-list.module';
import { WishlistComponent } from './wishlist/wishlist.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    BackToTopComponent,
    PrivacyPolicyComponent,
    OrderSummaryComponent,
    LoginComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    CheckoutComponent,
    OrderSummaryComponent,
    TermsConditionsComponent,
    DisclaimerComponent,
    ShippingReturnComponent,
    ChatBoxComponent,
    WishlistComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAnalyticsModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    LoaderModule,
    HolidayListModule,
    ReactiveFormsModule,
    AngularFireStorageModule,
    AngularFirestoreModule.enablePersistence(),
    ToastrModule.forRoot({
      timeOut: 3000,
      }),
        NgxPaginationModule,
        CarouselModule

  ],
  providers: [AngularFireAuth],
  bootstrap: [AppComponent]
})
export class AppModule { }
