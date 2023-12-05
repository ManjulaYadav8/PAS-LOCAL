import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';
import { CompanyService } from 'src/app/common/services/company.service';
import { ContactService } from 'src/app/common/services/contact.service';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {

  email = true;
  whatsapp = false;
  companyList;
  chatDisplay = false;
  companyMobile;
  alertMessages: AlertMessage[];
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(public contactService: ContactService,  private analyticsService : AnalyticsService,
             private toastr: ToastrService, private firestore: AngularFirestore,private router: Router,
             private companyService: CompanyService, private alertMsgService: AlertMessageService) { }

  ngOnInit() {
    this.getCompanyInfo();
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

  sendWhatapp(){
    window.open(`https://wa.me/${this.companyMobile}/?text=Hello, I am interested in ASB Good Foods`, "_blank");
  }
  sendMail(value){
   if(value == 'email'){
     this.email = true;
     this.whatsapp = false;
   }else{
     this.email = false;
     this.whatsapp = true;
   }
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
    }
    this.analyticsService.setAuthEvent('leads','email',analyticsData);

    data.subject = `Inquiry Email from ${data.fullName} from Chat`;
    this.firestore.collection('Contact').add(data).then(docRef => {
      let contactdocId = docRef.id;
      this.firestore.collection('Contact').doc(contactdocId).update({'contactDocId': contactdocId});
    })
    var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'contact_Message_Submit').pop();
    var alertMsg = productAlert.alertMsgType;
    this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading+ " "+data.fullName);
  }
  getCompanyInfo(){
    var mobile;
    this.companyService.getCompanyData().subscribe(shipping =>{
      this.companyList = shipping.data(); 
     mobile = this.companyList.mobile;
     this.companyMobile = mobile.replace(/[- )(+.]/g,'');
      })
  }
}
