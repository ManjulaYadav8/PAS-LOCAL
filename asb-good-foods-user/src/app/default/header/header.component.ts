import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Banner } from 'src/app/common/models/banner.model';
import { Cart } from 'src/app/common/models/cart.model';
import { MetaTag } from 'src/app/common/models/meta-tag.model';
import { Navbar } from 'src/app/common/models/navbar.model';
import { AnalyticsService } from 'src/app/common/services/analytics.service';
import { BannerService } from 'src/app/common/services/banner.service';
import { CartService } from 'src/app/common/services/cart.service';
import { LoginService } from 'src/app/common/services/login.service';
import { MetaTagService } from 'src/app/common/services/meta-tag.service';
import { NavbarService } from 'src/app/common/services/navbar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  bannerList: Banner[];
  navbarList: Navbar[];
  metaTagList : MetaTag[];
  logoImage: string = " ";
  navbarMeta = [];
  firstHalfNavbar = [];
  lastHalfNavbar = [];
  private refreshSubscription: Subscription;
  user;
  userDisplay;
  deptId = 1;
  categoryId = 1;
  cartItems: Cart[];
  cartLength = 0;
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private router: Router, private bannerService: BannerService, private loginService: LoginService,
    private metaTagService : MetaTagService,private analyticsService : AnalyticsService,
    private navbarService: NavbarService,private firestore: AngularFirestore, private cartService: CartService) { }

  ngOnInit() {
  this.loginService.checkGuestUser().then(res => {
    this.refreshSubscription = interval(1000).subscribe(
      (val) =>{
        this.loginService.getUserState().subscribe(user => {
          this.user = user;
        });
        this.getLocalName();
      })
    // this.getBannerList();
    this.cartService.cartLengthObs.subscribe(res => {
      this.cartLength = res;
    });
    
    this.getNavbarList();
   })
  }
  @HostListener("window:scroll", []) onWindowScroll() {
    this.scrollFunction();
  }
  // When the user scrolls down 20px from the top of the document, show the button
scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}
// When the user clicks on the button, scroll to the top of the document
topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
getLocalName(){
  this.userDisplay = JSON.parse(localStorage.getItem('email'));
 }
 getNavbarList(){
  this.navbarService.getNavbar().subscribe(navbar =>{
    this.navbarList = navbar.docs.map(list =>{
      return{
        navbarDocId: list.id,
                    ...list.data() as {}
      }as Navbar;
    })
    this.navbarList.sort(function(a,b){
      return a.navbarId-b.navbarId;
    })
    this.getSeparateNavbar(this.navbarList);
    this.getMetaTagList(this.navbarList);
  })
}
getSeparateNavbar(navbarList){
  let navbarLenght = navbarList.length;
  let firstHalf = Math.round(navbarLenght/2);
  this.firstHalfNavbar = [];
  this.lastHalfNavbar = [];
for(var i=0; i<firstHalf; i++){
  this.firstHalfNavbar.push(navbarList[i]);
}
for(var j=firstHalf; j<navbarLenght; j++){
  this.lastHalfNavbar.push(navbarList[j]);
}
}
getMetaTagList(navbarList){
  this.navbarMeta = [];
  navbarList.map((item,index) => {
    this.metaTagService.getMetaTagList(item.navbarDocId).subscribe(res => {
      if(res){
        this.metaTagList = res.docs.map(tag => {
          if(tag.exists){
            return {
              metaTagId : tag.id,
              ...tag.data()
            } as MetaTag
          }
        })
        this.navbarMeta.push(Object.assign(item,{"metaTag" : this.metaTagList}));
        if(index+1 === navbarList.length){
          localStorage.setItem('navbarList',JSON.stringify(this.navbarMeta));
        }
      }
    })
  })
}
getBannerList(){
  this.bannerService.getBannerList().subscribe(banner =>{
   this.bannerList = banner.map(list =>{
     return{
       bannerDocId:list.payload.doc.id,
                  ...list.payload.doc.data() as {}
     }as Banner
   })
  //  console.log(this.bannerList)
  this.getLogo(this.bannerList);
  })
}
getLogo(bannerList){
  for(var i=0; i<bannerList.length; i++){
    if(bannerList[i].bannerType == 'logo'){
      this.logoImage = bannerList[i].bannerImage;
    }
  }
}
getCompanyConfig(){
  if(!JSON.parse(localStorage.getItem('companyConfig'))){
    this.firestore.collection('ConfigInfo').doc('config').get().subscribe(res => {
      var companyConfig = res.data();
      if(res.data()){

        var  configObject = { "companyName" : companyConfig["companyName"],
                            "country" : companyConfig["country"],
                            "isoCode" : companyConfig["isoCode"],
                            "phoneCode" : companyConfig["phoneCode"],
                            "currencyCode" : companyConfig["currencyCode"],
                            "currencySymbol" : companyConfig["currencySymbol"],   
                            "taxationStandard" : companyConfig["taxationStandard"],
                            "preOrderTime" : companyConfig["orderTimeSetting"],
                            "timeZone" : companyConfig["timeZone"],
                            "taxSetting" : companyConfig["taxSetting"],
                             "locationmap" : companyConfig["locationmap"],
                             "paypal" : companyConfig["paypal"]};
        localStorage.setItem('companyConfig',JSON.stringify(configObject));
        this.companyConfig = configObject;
      }
    })
    }
   }
selectednavbar(navbar){
  if(navbar){
    this.analyticsService.setLogEvent('views','page',navbar,'navbar');
  }
  if(navbar === 'products'){
    this.router.navigate([`/products/${this.deptId}`, this.categoryId])
  }else{
    this.topFunction();
    this.router.navigate([`/${navbar}`]);
  }
}
login(){
  this.topFunction();
this.router.navigate(['/login']);
}
cart(){
  this.topFunction();
  this.router.navigate(['/cart']);
}
profile(){
  this.topFunction();
  this.router.navigate(['/profile'])
}
}
