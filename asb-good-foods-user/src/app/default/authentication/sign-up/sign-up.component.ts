import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/common/services/login.service';
declare var $ : any;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  mobNumberPattern = "^[0-9]{6,12}$";
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
  b = [];  
  token;
  authError: any;
  activateRoute;
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private authService: LoginService,private router: Router,private firestore: AngularFirestore,
    private route:  ActivatedRoute, private toastr: ToastrService) { }

  ngOnInit() {
    this.authService.eventAuthError$.subscribe(data =>{
      this.authError = data;
    })
    $('[data-toggle="popover"]').popover({
      sanitizeFn: function (content) {return content;}
    });
    $('.popover-dismiss').popover({
      trigger: 'focus'
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
  gettoken(length){
    for (var i=0; i<length; i++) {
   const j = (Math.random() * (this.a.length-1)).toFixed(0);
    this.b[i] = this.a[j];
   }
  this.token = this.b.join("");
 }
  createUser(formValue){
    this.gettoken(20);
  this.authService.createUser(formValue.value, this.token);
  this.resetForm(formValue);
   this.topFunction();
    }
    resetForm(userRegForm?: NgForm) {
      if (userRegForm != null)
      userRegForm.resetForm();
      this.authService.userData = {
        email: '',
        fullName:'',
        password:'',
        confirmPassword:'',
        mobile:null,
        userDocId:'',
        status:'',
        emailVerified:false,
        registrationTime: null,
        registrationDate:null
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
