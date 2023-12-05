import { Component, HostListener } from '@angular/core';
import { Banner } from './common/models/banner.model';
import { BannerService } from './common/services/banner.service';
import { LoginService } from 'src/app/common/services/login.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Asbgoodfood';
  
  deferredPrompt: any;
  showButton = false;
  bannerList: Banner[];
  logoImage;
constructor(private bannerService: BannerService,private loginService: LoginService){}
ngOnInit(){
this.loginService.checkGuestUser().then(res => {
  // this.getBannerList();
});
this.setCookieConsent();
}
setCookieConsent(){
  let cc = window as any;
  cc.cookieconsent.initialise({
    palette: {
      popup: {
        background: "#2A8168"
      },
      button: {
        background: "#ffe000",
        text: "#2A8168"
      }
    },
    theme: "classic",
    content: {
      message: "This website uses cookies to ensure you get the best experience on our website.",
      dismiss: "Got it!",
      link: "Learn More",
      href:  "/privacy" 
    }
  });
}
  @HostListener('window:beforeinstallprompt', ['$event'])
onbeforeinstallprompt(e) {
  // console.log(e);
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  this.deferredPrompt = e;
  this.showButton = true;
}
addToHomeScreen() {
  // hide our user interface that shows our A2HS button
  this.showButton = false;
  // Show the prompt
  if (this.deferredPrompt) {
  this.deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  
  this.deferredPrompt.userChoice
  .then((choiceResult) => {
  if (choiceResult.outcome === 'accepted') {
    // console.log('User accepted the A2HS prompt');
  } else {
    // console.log('User dismissed the A2HS prompt');
  }
  this.deferredPrompt = null;
});
}

}
// getBannerList(){
//   this.bannerService.getBannerList().subscribe(banner =>{
//    this.bannerList = banner.map(list =>{
//      return{
//        bannerDocId:list.payload.doc.id,
//                   ...list.payload.doc.data() as {}
//      }as Banner
//    })
//   this.getAbout(this.bannerList);
//   })
// }
// getAbout(bannerList){
//   for(var i=0; i<bannerList.length; i++){
//     if(bannerList[i].bannerType == 'logo'){
//       this.logoImage = bannerList[i].bannerImage;
//     }
//   }
// }
}

