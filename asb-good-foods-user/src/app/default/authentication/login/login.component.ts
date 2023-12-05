import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { Login } from 'src/app/common/models/login.model';
import { LoginService } from 'src/app/common/services/login.service';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { take } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  admin;
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  authError: any;
  email;
  deactivatedEmail;
  userList: Login[];
  deactivatedList = [];
  allUserList;
  alertMessages: AlertMessage[];
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private loginService: LoginService, private router: Router, private firestore: AngularFirestore,
    private toastr: ToastrService, private angularFireAnalytics: AngularFireAnalytics, private alertMsgService: AlertMessageService) { }

  ngOnInit() {
    this.loginService.checkGuestUser().then(res => {
      this.getCompanyConfig();
      this.getAllTheUser();
      this.getAlertMessages();
      this.loginService.eventAuthError$.subscribe(data => {
        this.authError = data;
      })
      this.loginService.getUserState().subscribe(user => {
        this.admin = user;
      })
    });
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
  getAllTheUser() {
    this.firestore.collection('/User').snapshotChanges().pipe(take(1)).subscribe(user => {
      this.userList = user.map(list => {
        return {
          userDocId: list.payload.doc.id,
          ...list.payload.doc.data() as {}
        } as Login;
      })
      this.getDeactiveList(this.userList);
    })
  }
  getDeactiveList(userList) {
    this.allUserList = userList;
    for (var i = 0; i < userList.length; i++) {
      if (userList[i].status == "deactive") {
        this.deactivatedList.push(userList[i].email);
      }
    }
  }
  login(formVal) {
    
    const validEmail = this.allUserList.find(v => v.email === formVal.value.email);
    const obj = this.deactivatedList.find(o => o.email == formVal.value.email);
    
    if (!validEmail) {
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'invalid_Email_ID').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
    } else {

      if (obj === formVal.value.email) {
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'deactivated_User').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
      } else {
        const verfiedList = this.allUserList.find(o => o.email == formVal.value.email);
        if (verfiedList.emailVerified == true) {
          this.loginService.loginserv(formVal.value.email, formVal.value.password, "App");
        } else {
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'verify_Email').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
        }
        this.logresetForm();
      }
    }

  }
  logresetForm(userlogForm?: NgForm) {
    if (userlogForm != null)
      userlogForm.resetForm();
    this.loginService.userData = {
      email: '',
      password: '',
      confirmPassword: '',
      mobile: null,
      userDocId: '',
      fullName: '',
      status: '',
      emailVerified: false,
      registrationTime: null,
      registrationDate: null
    }
  }

  getEmail() {
    this.email = JSON.parse(localStorage.getItem('email'));
    //// console.log(this.email[0]);y
  }
  getCompanyConfig() {
    // this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
    // console.log(this.companyConfig);
    // if (!this.companyConfig) {
      this.firestore.collection('ConfigInfo').doc('config').get().subscribe(res => {
        var companyConfig = res.data();
        if (res.data()) {

          var configObject = {
            "companyName": companyConfig["companyName"],
            "country": companyConfig["country"],
            "isoCode": companyConfig["isoCode"],
            "phoneCode": companyConfig["phoneCode"],
            "currencyCode": companyConfig["currencyCode"],
            "currencySymbol": companyConfig["currencySymbol"],
            "taxationStandard": companyConfig["taxationStandard"],
            "preOrderTime": companyConfig["orderTimeSetting"],
            "timeZone": companyConfig["timeZone"],
            "taxSetting" : companyConfig["taxSetting"],
            "locationmap": companyConfig["locationmap"],
            "paypal" : companyConfig["paypal"]
          };
          localStorage.setItem('companyConfig', JSON.stringify(configObject));
          this.companyConfig = configObject;
        }
      })
    // }
  }

}
