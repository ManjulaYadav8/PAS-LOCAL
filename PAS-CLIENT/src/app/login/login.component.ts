import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasServiceService } from '../Service/pas-service.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  error: boolean = false;
  errorMessage: String = "";
  dataLoading: boolean = false;

  savedChanges: boolean = false;
  showErrorMsg = false;
  show: boolean=false;

  mobNumberPattern = "^[0-9]{10,13}$";
  pwdPattern = "^[a-z0-9._%+-@#$!&*]{8,20}$";
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";


  customer: any;
  fastagCustomer: any;
  bpclSfaToken: any;



  loginform: any;

  // driverData = {
  //   full_name: "Ravi",
  //   home_page: "/app",
  //   message: {
  //     api_key: "af78ae01fb8094d",
  //     api_secret: "29f5d5251008bb7",
  //     email: "ravik@codeswift.in",
  //     message: "Authentication success",
  //     sid: "fcb95ca0dc3386ea5a78a03d6aa62c7a8c5315c6595bdba1d9a2d6f6",
  //     success_key: 1,
  //     username: "ravi",
  //     role:"owner",
  //   }
  // }

  userInfo: any;
  constructor(private router: Router, private fb: FormBuilder, private _passervice: PasServiceService, private toastrService: ToastrService,) {
    this.loginform = new FormGroup({
      usr: new FormControl("", [Validators.required]),
      pwd: new FormControl("", [Validators.required])
    })
  }

  ngOnInit() {
    // this.loginResetForm();
    // this.getInsuranceToken();
    // this.getReceipt();
    // setTimeout(()=>{
    //   this.downloaddoc();
    // },1000)




  }
  getReceipt(){
    this._passervice.receipt().subscribe((res)=>{
      console.log(res);
      
    })
  }
  downloaddoc(){
    this._passervice.document().subscribe((res)=>{
      console.log(res);
      
    })
  }

  login() {
    console.log(this.loginform.value);
    this.router.navigate(["./dashboard"])
    // if (this.loginform.value) {

    //   // this.router.navigate(["./items"])
    //   this._passervice.login(this.loginform.value).subscribe((res: any) => {
    //     console.log("response--->", res)
    //     if (res.message.success_key == 1) {
    //       localStorage.setItem("api_key", res.message.api_key);
    //       localStorage.setItem("api_secret", res.message.api_secret);
    //       Swal.fire({
    //         position: 'center',
    //         icon: 'success',
    //         title: 'Login Successfully',
    //         showConfirmButton: true,
    //         timer: 1500,
    //         showClass: {
    //           popup: 'animate__animated animate__fadeInDown'
    //         },
    //         hideClass: {
    //           popup: 'animate__animated animate__fadeOutUp'
    //         }
    //       })

    //     this.router.navigate(["./items"])



    //     }
    //     else {
    //       Swal.fire({
    //         position: 'center',
    //         icon: 'error',
    //         title: 'Wrong Username and password',
    //         showConfirmButton: true,
    //         timer: 1500,
    //         showClass: {
    //           popup: 'animate__animated animate__fadeInDown'
    //         },
    //         hideClass: {
    //           popup: 'animate__animated animate__fadeOutUp'
    //         }
    //       })
    //       // this.router.navigate(["./salesorder"])

    //     }
    //   })
    // }


  }

  showPassword(val:any) {
    // if (val) {
    //   this.show = true;
    // } else {
    //   this.show = false;
    // }
  }

  // loginResetForm(formData?: NgForm) {
  //   if (formData != null)
  //     formData.reset();

  //   this._erpNextApiService.LoginData = {
  //     usr: '',
  //     pwd: '',
  //     mobile_no: null
  //   }
  // }
  // getSelect(val) {
  //   if (val) {
  //     this.show = true;
  //   } else {
  //     this.show = false;
  //   }
  // }
  // login(formData) {

  //   window.localStorage.removeItem('token');
  //   window.localStorage.removeItem('userName');
  //   window.localStorage.removeItem('isAdmin');
  //   window.localStorage.removeItem('userId');
  //   console.log(formData);


  //   this.dataLoading = true;
  //   this.querySubscription = this._erpNextApiService.login(formData).subscribe((res) => {
  //   //  console.log(res);
  //     if (res["errorCode"] == '0') {

  //       this.error = false;
  //       this.errorMessage = "";
  //       this.dataLoading = false;

  //       window.localStorage.setItem('apiKey', res["data"].message.api_key);
  //       window.localStorage.setItem('apiSecret', res["data"].message.api_secret);
  //       window.localStorage.setItem('email', res["data"].message.email);
  //       // localStorage.setItem('userRole', res["data"].message.role);
  //     //console.log(res);
  //       if (res["data"].message.success_key == 1) {
  //         this.getUserDetails();
  //       } else {
  //         this.showErrorMsg = true;
  //         this.tostr.error("Enter valid credentials");
  //       }
  //     } else {
  //       this.error = true;
  //       this.errorMessage = res["errorMessage"];
  //       this.dataLoading = false;
  //     }
  //   },
  //     (error) => {
  //       this.error = true;
  //       this.errorMessage = error.message;
  //       this.dataLoading = false;
  //     },
  //     () => {
  //       this.dataLoading = false;
  //     });
  // }
  // getUserDetails() {
  //   this.dataLoading = true;

  //   this.querySubscription = this._erpNextApiService.getUserDetails().subscribe((res) => {
  //     // console.log(res);
  //     if (res["errorCode"] == '0') {
  //       this.error = false;
  //       this.errorMessage = "";
  //       this.dataLoading = false;
  //       this.userInfo = res["data"]["data"];
  //       this.customer=this.userInfo.customer;

  //    //console.log(this.userInfo.api_secret);
  //    window.localStorage.setItem('mobile_no',res["data"]["data"]['mobile_no']);
  //      window.localStorage.setItem('FAID',this.userInfo.fa_id);
  //      window.localStorage.setItem('FCID',this.userInfo.fc_id);
  //      window.localStorage.setItem('SFAID',this.userInfo.sfa_id);
  //     localStorage.setItem('userRole',this.userInfo.role_profile_name);
  //     window.localStorage.setItem('customer',this.userInfo.customer);
  //     window.localStorage.setItem('userName', this.userInfo.first_name);
  //     window.localStorage.setItem('fasTagCustomerId',this.userInfo.fastag_merchantid);
  //     window.localStorage.setItem('marchantid',this.userInfo.fastag_merchantid)
  //     this.customerParams = `?filters=[["name","=","${this.userInfo.customer}"]]&fields=["name","tax_category","tax_id"]`
  //     // localStorage.setItem('bpclDiscount',this.userInfo.bpcl_discount);
  //     this.getInsuranceToken();
  //     this.getCustomer();
  //     this.getBPCLSFAAuthentication();
  //     this.getBPCLFAAuthentication();
  //     // this.getFastagDoctypeId() ;
  //     this.getFastagCustomerDetails(this.customer);
  //     // this.getBPCLSFAToken();
  //     if(this.userInfo.role_profile_name === 'Owner'){
  //       this.tostr.success("Login Successful");
  //       localStorage.setItem("authModule",JSON.stringify(this.ownerAuthModules));
  //       // this.router.navigate(['/dashboard']);
  //       setTimeout(()=>{
  //         this.router.navigate(['/operator-dashboard']);
  //       },2000)
  //       // this.router.navigate(['/operator-dashboard']);
  //     }else {
  //       localStorage.setItem("authModule",JSON.stringify(this.driverAuthModules));
  //       // this.router.navigate(['/dashboard']);
  //       setTimeout(()=>{
  //         this.router.navigate(['/operator-dashboard']);
  //       },2000)
  //     }
  //     } else {
  //       this.error = true;
  //       this.errorMessage = res["errorMessage"];
  //       this.dataLoading = false;
  //     }
  //   },
  //     (error) => {
  //       this.error = true;
  //       this.errorMessage = error.message;
  //       this.dataLoading = false;
  //     },
  //     () => {
  //       this.dataLoading = false;
  //     });
  // }  
  // getCustomer() {
  //   this.dataLoading = true;
  //   // console.log("customParams--->",this.customerParams);

  //   this.querySubscription = this._erpNextApiService.getCustomerDetails(this.customerParams).subscribe((res) => {
  //   //console.log(res);
  //     if (res["errorCode"] == '0') {
  //       // console.log("customer details--->",res);

  //       this.error = false;
  //       this.errorMessage = "";
  //       this.dataLoading = false;
  //       this.customerDetails = res["data"]["data"][0];
  //       // console.log("Loggeg In Customer Details---->",res);
  //     //console.log(this.customerDetails);
  //       window.localStorage.setItem('tax_category',this.customerDetails.tax_category);
  //       //console.log(this.parentLevelItemGroup);
  //       // this.config = {
  //       //   id: 'custom',
  //       //   itemsPerPage: 8,
  //       //   currentPage: 1,
  //       //   totalItems: this.itemList.length
  //       // };
  //     } else {
  //       this.error = true;
  //       this.errorMessage = res["errorMessage"];
  //       this.dataLoading = false;
  //     }
  //   },
  //     (error) => {
  //       this.error = true;
  //       this.errorMessage = error.message;
  //       this.dataLoading = false;
  //     },
  //     () => {
  //       this.dataLoading = false;
  //     });
  // }
  // getBPCLSFAAuthentication(){
  //   this.dataLoading = true;
  //   this.querySubscription = this._erpNextApiService.getBPCLSFAAuthentication().subscribe((res) => {
  //     if (res["errorCode"] == '0') {
  //         this.error = false;
  //         this.errorMessage = "";
  //         this.dataLoading = false;
  //         this.bpclCredits = res["data"];
  //     //console.log(this.bpclCredits);
  //      this.bpclSFAAccessToken = this.bpclCredits.access_token;
  //    // console.log(this.bpclFAAccessToken);
  //      localStorage.setItem('bpclSFAAccessToken',this.bpclSFAAccessToken);
  //       } else {
  //         this.error = true;
  //         this.errorMessage = res["errorMessage"];
  //         this.dataLoading = false;
  //     }
  //   },
  //     (error) => {
  //         this.error = true;
  //         this.errorMessage = error.message;
  //         this.dataLoading = false;
  //     },
  //     () => {
  //         this.dataLoading = false;
  //     });
  // }
  // getBPCLFAAuthentication(){
  //   this.dataLoading = true;
  //   this.querySubscription = this._erpNextApiService.getBPCLFAAuthentication().subscribe((res) => {
  //     if (res["errorCode"] == '0') {
  //         this.error = false;
  //         this.errorMessage = "";
  //         this.dataLoading = false;
  //         this.bpclCredits = res["data"];
  //     //console.log(this.bpclCredits);
  //      this.bpclFAAccessToken = this.bpclCredits.access_token;
  //    // console.log(this.bpclFAAccessToken);
  //      localStorage.setItem('bpclFAAccessToken',this.bpclFAAccessToken);
  //       } else {
  //         this.error = true;
  //         this.errorMessage = res["errorMessage"];
  //         this.dataLoading = false;
  //     }
  //   },
  //     (error) => {
  //         this.error = true;
  //         this.errorMessage = error.message;
  //         this.dataLoading = false;
  //     },
  //     () => {
  //         this.dataLoading = false;
  //     });
  // }





  //bpcl auth token
  // getBPCLSFAToken() {
  //     this._erpService.getBPCLSFAAuthentication().subscribe(res => {
  //       console.log("bpcl SFA token--->", res);
  //       if (res["errorCode"] == "0") {
  //         this.bpclSfaToken = res["data"]["access_token"];
  //         localStorage.setItem("bpclSFA Token", this.bpclSfaToken)


  //       }

  //     })
  //   }




  //fastag

  // getFastagDoctypeId() {

  //   let customParams = `?filters=[["name","=","${this.customer}"]]&fields=["name","tax_category","tax_id","fastag_customer"]`
  //   this._erpService.getCustomerDetails(customParams).subscribe((res) => {
  //     console.log("customer details---->", res);
  //     if (res["errorCode"] == '0' && res["data"]) {
  //       this.fastagCustomer = res['data']['data'][0]['fastag_customer'];
  //       // this.getFastagCustomerDetails(this.fastagCustomer);
  //     }

  //   })
  // }



  // getFastagCustomerDetails(fastagCustomer) {
  //   this.dataLoading = true;

  //   // console.log("userEmail------->", this.userEmail);


  //   // let fasTagParams = `?filters=[["user","=","${this.userEmail}"]]&fields=["requestid","requesttime","requestsource","merchantid","firstname","lastname","mobileno","emailid","dob","address","city","state","pincode","accountnumber","ifsccode","branchname","vehregno","vehicleclass","vehiclecat","partnerrefid","walletid"]`;

  //   this._erpService.getFastagCustomerId(fastagCustomer).subscribe(res => {

  //     // window.localStorage.setItem("",res["data"][""]);

  //     if (res["errorCode"] == '0') {
  //       // console.log("FastagCustomerDetails------>", res["data"]);

  //       window.localStorage.setItem("requsetSource", res["data"]["requestsource"]);
  //       window.localStorage.setItem("walletid", res["data"]["walletid"]);
  //       window.localStorage.setItem("marchantid", res["data"]["merchantid"]);
  //       // this.getFastagWalletEncryptDetails();
  //       // this.getDailyFastagTxnEncryptDetails();
  //       // this.getWeeklyFastagTxnEncryptDetails();
  //       // this.getFastagTxnEncryptDetails();
  //       this.dataLoading = false;

  //       // console.log("FastagCustomerDetails------>", res);
  //       // for (let data of res["data"]) {
  //       //   this.fastagCustomerDetails = data;
  //       //   if (this.fastagCustomerDetails) {
  //       //     this.getFastagWalletEncryptDetails();
  //       //     this.getFastagTxnEncryptDetails();

  //       //   }

  //       // }



  //     }
  //     else {
  //       console.log("fastag get customer details error");

  //     }

  //   })

  // }



  //Insurance Token 
  // getInsuranceToken(){
  //   let body={
  //     "clientid": "197786",
  //     "appid":"57890198",
  //     "slt": "ytrgfb34",
  //     "hashval": "b0aa9017d743e4eef91362acb4c370d63da1f6bb54811f9e7f3019c6ae1fefeea73cd88d83927377c3c9b17dba15873cae762dfa82f221d94bdc07f31ccfcfba"
  // }

  // this._erpNextApiService.getInsuranceToken(body).subscribe(res=>{
  //   console.log("getInsuranceToken--->",res);

  //   if(res['data'].token && res['errorCode']=='0'){
  //     localStorage.setItem('InsuranceToken',res['data'].token);
  //   }

  // })

  // }
}
