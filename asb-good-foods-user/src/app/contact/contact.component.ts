import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Banner } from '../common/models/banner.model';
import { AnalyticsService } from '../common/services/analytics.service';
import { BannerService } from '../common/services/banner.service';
import { CompanyService } from '../common/services/company.service';
import { ContactService } from '../common/services/contact.service';
import { MetaTagService } from '../common/services/meta-tag.service';
import { LoginService } from '../common/services/login.service';
import { AlertMessageService } from '../common/services/alert-message.service';
import { AlertMessage } from '../common/models/alert-message.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  companyList;
  companyemail;
  bannerList: Banner[];
  contactImage: string = " ";
  companyMail;
  mobNumberPattern = "^[0-9]{6,12}$";
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  mapLocation: SafeResourceUrl = "";
  alertMessages: AlertMessage[];
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(public contactService: ContactService, private firestore: AngularFirestore, private companyService: CompanyService,
    private toastr: ToastrService, private bannerService: BannerService, private router: Router,
    private analyticsService : AnalyticsService,private sanitizer: DomSanitizer,private loginService: LoginService,
    private metaTagService : MetaTagService, private alertMsgService: AlertMessageService) { }
  ngOnInit() {
    this.loginService.checkGuestUser().then(res => {
      this.metaTagService.setTitleMetaTag(this.router.url);
      this.getCompanyConfig();
      this.getCompanyInfo()
      this.getBannerList();
      if(this.companyConfig){
       this.mapLocation =  this.sanitizer.bypassSecurityTrustResourceUrl(""+`${this.companyConfig.locationmap}`+"");
      }
    });
    this.contactResetForm();
    this.getAlertMessages();
  }
  getAlertMessages(){
    this.alertMsgService.getAlertMessage().subscribe(msg =>{
      this.alertMessages = msg.docs.map(list =>{
        return{
          alertMsgDocId : list.id,
                         ...list.data()
        }as AlertMessage
      })
    });
  }
  getCompanyInfo(){
    this.companyService.getCompanyData().subscribe(shipping =>{
      this.companyList = shipping.data(); 
     // console.log(this.companyList);
     this.companyMail = this.companyList.email
      })
      // console.log(this.companyMail)
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
  contactResetForm(contactForm?: NgForm) {
    if (contactForm != null)
    contactForm.resetForm();
    this.contactService.contactData = {
    fullName:'',
    email:'',
    phone:null,
    subject:'',
    message:'',
    contactDocId:'',
    companyMail:'',
    date: new Date()
    }
  }
  contactSubmit(contactForm?: NgForm){
    let data = Object.assign({},contactForm.value);
    var analyticsData = {
      "email" : data.email,
      "name" : data.fullName,
      "message" : data.message,
      "phone" : data.phone,
      "subject" : data.subject,
    }
    this.analyticsService.setAuthEvent('leads','contact-form',analyticsData);
    this.firestore.collection('Contact').add(data).then(docRef => {
      let contactdocId = docRef.id;
      this.firestore.collection('Contact').doc(contactdocId).update({'contactDocId': contactdocId});
    })
    var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'contact_Message_Submit').pop();
    var alertMsg = productAlert.alertMsgType;
    this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading+ " "+data.fullName); 
    // console.log(data);
    this.contactResetForm();
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([currentUrl]);
    })
    this.topFunction();
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
      if(bannerList[i].bannerType == 'contact'){
        this.contactImage = bannerList[i].bannerImage;
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
          this.mapLocation =  this.sanitizer.bypassSecurityTrustResourceUrl(""+`${this.companyConfig.locationmap}`+"");
        }
      })
      }
     }
}
