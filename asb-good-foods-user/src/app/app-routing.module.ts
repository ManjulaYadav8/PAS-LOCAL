import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { PrivacyPolicyComponent } from './business-document/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './business-document/terms-conditions/terms-conditions.component';
import { DisclaimerComponent } from './business-document/disclaimer/disclaimer.component';
import { ShippingReturnComponent } from './business-document/shipping-return/shipping-return.component';
import { ForgotPasswordComponent } from './default/authentication/forgot-password/forgot-password.component';
import { LoginComponent } from './default/authentication/login/login.component';
import { SignUpComponent } from './default/authentication/sign-up/sign-up.component';
import { WishlistComponent } from './wishlist/wishlist.component';
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {path:'login',component: LoginComponent},
  {path:'signup', component: SignUpComponent},
  {path:'forgotPass',component:ForgotPasswordComponent},
  {path:'checkout',component: CheckoutComponent},
  {path:'ordersummary', component: OrderSummaryComponent},
   {path:'home', loadChildren:() => import('./home/home.module').then(m => m.HomeModule)},
   {path:'about', loadChildren:() => import('./about/about.module').then(m => m.AboutModule)},
   {path:'contact',loadChildren:() => import('./contact/contact.module').then(m => m.ContactModule)},
  {path:'branches', loadChildren:() => import('./dealer/dealer.module').then(m => m.DealerModule)},
  {path:'products',loadChildren:() => import('./products/products.module').then(m => m.ProductsModule)},
  {path:'profile', loadChildren:() => import('./profile/profile.module').then(m => m.ProfileModule)},
  {path:'cart',loadChildren:() => import('./cart/cart.module').then(m => m.CartModule)},
  {path:'blog', loadChildren:() => import('./blog/blog.module').then(m => m.BlogModule)},
  {path:'wishlist', component:WishlistComponent},
  {path:'privacy', component: PrivacyPolicyComponent},
  {path:'terms',component:TermsConditionsComponent},
  {path:'disclaimer',component: DisclaimerComponent},
  {path:'return',component:ShippingReturnComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy:PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
