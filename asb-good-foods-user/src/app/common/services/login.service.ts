import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { Login } from '../models/login.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AnalyticsService } from './analytics.service';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { AlertMessageService } from './alert-message.service';
import { AlertMessage } from '../models/alert-message.model';
@Injectable({
  providedIn: 'root'
})
export class LoginService {

userData: Login;
newUser;
newuid;
newUrl;
companyName = "ASB Good Foods";
token;
tokenv;
companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
presentDate = new Date();
alertMessages: AlertMessage[];
private eventAuthError = new BehaviorSubject<string>("");
  eventAuthError$ = this.eventAuthError.asObservable();
  constructor(private afAuth: AngularFireAuth, private router: Router,
             private analyticsService : AnalyticsService,private toastr: ToastrService,
             private firestore: AngularFirestore, private alertMsgService: AlertMessageService) { }

  getUserState(){
    return this.afAuth.authState;
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
   loginserv(email:string, password: string,type){
     let userCred;
    return this.afAuth.signInWithEmailAndPassword(email,password)
    .catch(error =>{
      this.eventAuthError.next(error);
    })
    .then(userCredential =>{
      userCred = userCredential
      if(userCredential){
          this.saveDataInLocalStorage(type);
        if(type === "App"){
          setTimeout(()=>{
            this.router.navigate(['/home']);
          },1000)
        }
      }
    })
  }
 logout(){
   this.afAuth.signOut();
  this.router.navigate(['login']);
}
createUser(user, token){
  this.getAlertMessages();
  this.token = token;
  this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
  .then( userCredential =>{
    // this.SendVerificationMail();
    this.newUser= user;
    this.insertUserData(userCredential)
    .then(()=>{
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'registration').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
      this.router.navigate(['/login']);
    });
  })
 .catch( error =>{
   this.eventAuthError.next(error);
 })
//  this.saveDataInLocalStorage();
}

insertUserData(userCredential: firebase.default.auth.UserCredential){
  this.newuid = userCredential.user.uid;
  // console.log(this.newuid)
  this.tokenv = this.token.concat(this.newuid);
  return this.firestore.collection('User').doc(`${userCredential.user.uid}`).set({
    companyName:this.companyName,
    userType : "INDIVIDUAL",
    userSubType : "PRIMARY",
    name: this.newUser.fullName,
    email: this.newUser.email,
    mobile : this.newUser.mobile,
    status: "active",
    userDocId: this.newuid,
    token: this.tokenv,
    emailVerified: false,
    createdDtm : new Date().toLocaleString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}),
    registrationTime :this.presentDate.getTime(),
  }).then(res => {
    var userData = {
      "user-id" :this.newuid,
      "email_id": this.newUser.email,
      "user-type" : "INDIVIDUAL",
      "user-sub-type" : "PRIMARY",
      "name": this.newUser.fullName,
      "mobile" : this.newUser.mobile,
      "status": "active",
      "email-verified": false,
      "created-date" : new Date().toLocaleString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}),
      "registration-time" :this.presentDate.getTime(),
    }
    this.analyticsService.setAuthEvent('auth','signup',userData);

  })
}
saveDataInLocalStorage(userType){
this.afAuth.authState.pipe(take(1)).subscribe(user => {
  if (user){
    if(userType === "App"){
      this.newUser = user;
      localStorage.setItem('userid', JSON.stringify(this.newUser.uid));
      localStorage.setItem('email',JSON.stringify(this.newUser.email[0]));
      localStorage.setItem('emailId',JSON.stringify(this.newUser.email));
      localStorage.setItem('webUserType', JSON.stringify('App'));
      this.analyticsService.setAuthEvent('auth','login',{"user-id" : this.newUser.uid , "email-id" : this.newUser.email});
    }else{
      localStorage.setItem('webUserType', JSON.stringify('Guest'));
    }

  } 
})  
}

sendPasswordResetEmail(passwordResetEmail: string) {
  return this.afAuth.sendPasswordResetEmail(passwordResetEmail);
}
  checkGuestUser(){
    return new Promise((resolve,reject) => {
      if(!JSON.parse(localStorage.getItem('webUserType'))){
        resolve(this.loginserv(environment.guestUserEmail,environment.guestUserPass,"Guest"))
      }else{
        resolve(true)
      }
    })
  }
}
