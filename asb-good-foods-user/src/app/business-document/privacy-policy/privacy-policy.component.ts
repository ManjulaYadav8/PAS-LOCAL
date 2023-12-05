import { Component, OnInit } from '@angular/core';
import { Banner } from 'src/app/common/models/banner.model';
import { BusinessDocuments } from 'src/app/common/models/business-documents.model';
import { BannerService } from 'src/app/common/services/banner.service';
import { BusinessDocumentsService } from 'src/app/common/services/business-documents.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {

  bannerList: Banner[];
  privacyImage;
  businessDoc : BusinessDocuments[];
  businessData;
  documentHeading;
  constructor(private bannerService: BannerService, private businessDocService: BusinessDocumentsService) { }

  ngOnInit() {
    // this.getBannerList();
    this.getbusinessDocuments();
  }
  getbusinessDocuments(){
    this.businessDocService.getPrivacyPolicy().subscribe(business =>{
     this.businessDoc = business.docs.map(list =>{
       return{
         businessDocId: list.id,
                      ...list.data() as {}
       }as BusinessDocuments
     })
     this.businessData = this.businessDoc[0].businessData;
     this.documentHeading = this.businessDoc[0].businessDocHeading;
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
      if(bannerList[i].bannerType == 'privacypolicy'){
        this.privacyImage = bannerList[i].bannerImage;
      }
    }
  }
}
