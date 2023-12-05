import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Banner } from '../common/models/banner.model';
import { BusinessDocuments } from '../common/models/business-documents.model';
import { Carousel } from '../common/models/carousel.model';
import { BannerService } from '../common/services/banner.service';
import { BusinessDocumentsService } from '../common/services/business-documents.service';
import { CarouselService } from '../common/services/carousel.service';
import { LoginService } from '../common/services/login.service';
import { MetaTagService } from '../common/services/meta-tag.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  bannerList: Banner[];
  aboutImage:string = " ";
  logoImage: string = " ";
  carouselList: Carousel[];
  businessDoc: BusinessDocuments[];
  companyInfo;
  companyLogo;
  founderInfo;
  founderLogo;
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private bannerService: BannerService, private carouselService: CarouselService,private firestore: AngularFirestore,
             private metaTagService : MetaTagService,private router: Router, private businessDocService: BusinessDocumentsService,
             private loginService: LoginService) { }

  ngOnInit() {
    this.loginService.checkGuestUser().then(res => {
      this.getCompanyConfig();
      this.metaTagService.setTitleMetaTag(this.router.url);
      this.getBannerList();
      this.getAboutCarousel();
      this.getbusinessDocuments();
    });
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
getbusinessDocuments(){
  this.businessDocService.getAboutData().subscribe(business =>{
   this.businessDoc = business.docs.map(list =>{
     return{
       businessDocId: list.id,
                    ...list.data() as {}
     }as BusinessDocuments
   })
   this.companyInfo = this.businessDoc[0].businessData;
   this.companyLogo = this.businessDoc[0].companyLogo;
   this.founderInfo = this.businessDoc[0].businessSubData;
   this.founderLogo = this.businessDoc[0].founderLogo;
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
  this.getAbout(this.bannerList);
  })
}
getAbout(bannerList){
  for(var i=0; i<bannerList.length; i++){
    if(bannerList[i].bannerType == 'about'){
      this.aboutImage = bannerList[i].bannerImage;
    }
    if(bannerList[i].bannerType == 'logo'){
      this.logoImage = bannerList[i].bannerImage;
    }
  }
  // console.log(this.aboutImage)
}
getAboutCarousel(){
  this.carouselService.getAboutCarousel().subscribe(carousel =>{
    this.carouselList = carousel.map(list =>{
      return{
        carouselDocId: list.payload.doc.id,
                     ...list.payload.doc.data() as {}
      }as Carousel;
    })
  })
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
      }
    })
    }
   }
}
