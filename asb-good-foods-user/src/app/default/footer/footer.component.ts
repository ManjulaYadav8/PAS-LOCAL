import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Banner } from 'src/app/common/models/banner.model';
import { Navbar } from 'src/app/common/models/navbar.model';
import { BannerService } from 'src/app/common/services/banner.service';
import { CompanyService } from 'src/app/common/services/company.service';
import { LoginService } from 'src/app/common/services/login.service';
import { NavbarService } from 'src/app/common/services/navbar.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  companyAddress;
  presentYear;
  bannerList: Banner[];
  navbarList: Navbar[];
  parentLogos = [];
  logoImage:string = " ";
  deptId = 1;
  categoryId = 1;
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private companyService: CompanyService, private bannerService: BannerService,private router: Router,
    private navbarService:NavbarService,private firestore: AngularFirestore,private loginService: LoginService) { }

  ngOnInit() {
  this.loginService.checkGuestUser().then(res => {
    this.getCompanyConfig();
    this.getCompanyAddress();
    this.getBannerList();
    this.getNavbarList();
    if(this.companyConfig){
      this.presentYear = new Date().toLocaleString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split(",")[0].split("/").pop();
    }
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
  getCompanyAddress(){
   this.companyService.getCompanyData().subscribe(company =>{
    this.companyAddress = company.data()
    // console.log(this.companyAddress)
   })
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
  this.getParentLogo(this.bannerList);
  })
}
getParentLogo(bannerList){
  this.parentLogos = [];
for(var i=0; i<bannerList.length; i++){
  if(bannerList[i].bannerType == 'parentLogo'){
    this.parentLogos.push(bannerList[i]);
  }
  if(bannerList[i].bannerType== 'logo'){
    this.logoImage = bannerList[i].bannerImage;
  }
}
}
setDocTitle(selector) {
  document.querySelector(selector) ? selector : null;
}
selectednavbar(navbar){
  this.topFunction();
  
    this.router.navigate([`/${navbar}`]);
  
}
getCompanyConfig(){
  this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  // console.log(this.companyConfig);
  if(!this.companyConfig){
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
        this.presentYear = new Date().toLocaleString('en-US', {timeZone: `${this.companyConfig.timeZone}`}).split(",")[0].split("/").pop();
      }
    })
    }
   }
}
