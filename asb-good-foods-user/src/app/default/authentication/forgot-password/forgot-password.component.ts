import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { LoginService } from 'src/app/common/services/login.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  alertMessages: AlertMessage[];
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private loginService: LoginService, private router:Router, private toastr: ToastrService,
    private alertMsgService: AlertMessageService) { }

  ngOnInit() {
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
  forgot(email){
    this.loginService.sendPasswordResetEmail(email.value.email);
    var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'forgot_Password_Email').pop();
    var alertMsg = productAlert.alertMsgType;
    this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);      
    this.router.navigate(['/login']);
    this.topFunction();
  }

}
