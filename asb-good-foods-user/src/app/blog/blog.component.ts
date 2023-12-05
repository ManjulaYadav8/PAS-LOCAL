import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Banner } from '../common/models/banner.model';
import { Blog } from '../common/models/blog.model';
import { SideImage } from '../common/models/side-image.model';
import { BannerService } from '../common/services/banner.service';
import { BlogService } from '../common/services/blog.service';
import { LoginService } from '../common/services/login.service';
import { MetaTagService } from '../common/services/meta-tag.service';
import { SideImageService } from '../common/services/side-image.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

blogList: Blog[];
config;
bannerList: Banner[];
sideImage: SideImage[];
blogSide;
selectedBanner;
selectedBannerImg;
public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private blogService: BlogService, private bannerService: BannerService,private metaTagService : MetaTagService,
    private firestore: AngularFirestore, private router: Router, private sideService: SideImageService,
    private loginService: LoginService) { }


ngOnInit() {
  this.config = {
    id: 'custom',
    itemsPerPage: 4,
    currentPage: 1,
    totalItems: 4
  };
this.loginService.checkGuestUser().then(res => {
  this.getCompanyConfig();
  this.metaTagService.setTitleMetaTag(this.router.url);
  this.getBlogList();
  this.getSideList();
})
  // this.getBannerList();
}
getBannerList(){
  this.bannerService.getBannerList().subscribe(banner =>{
   this.bannerList = banner.map(list =>{
     return{
       bannerDocId: list.payload.doc.id,
                  ...list.payload.doc.data() as {}
     }as Banner;
   })
   this.selectedBanner = this.bannerList.filter(banner => banner.bannerType == "blog")
   this.selectedBannerImg = this.selectedBanner[0].bannerImage;
  //  console.log(this.selectedBannerImg)
  })
}
getBlogList(){
  this.blogService.getBlog().subscribe(blog =>{
   this.blogList = blog.map(list =>{
     return{
       blogDocId: list.payload.doc.id,
                ...list.payload.doc.data() as {}
     }as Blog;
   })
   this.config = {
    id: 'custom',
    itemsPerPage: 4,
    currentPage: 1,
    totalItems: this.blogList.length
  };
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
blogView(blogId){
this.topFunction();
this.router.navigate(['/blog', blogId]);
}
getSideList() {
  this.sideService.getSideImg().subscribe(side => {
    this.sideImage = side.map(list => {
      return {
        sideImgDocId: list.payload.doc.id,
        ...list.payload.doc.data() as {}
      } as SideImage;
    })
    // console.log(this.sideList);
    this.getseparateside(this.sideImage);
  })
}

getseparateside(sideList) {
  for (var i = 0; i < sideList.length; i++) {
    if (sideList[i].sideType == 'blog') {
      this.blogSide = sideList[i].sideimgUrl;
    }      
  }
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
