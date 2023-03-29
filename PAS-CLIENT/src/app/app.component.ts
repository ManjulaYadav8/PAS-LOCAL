import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PAS';

  routerLink:any;
  addItemrouterLink:any;


  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe((event:any)=>{
      // console.log(event);

      if (event instanceof NavigationEnd) {
        this.routerLink = this.router.url;

        this.routerLink = this.routerLink.split("?")[0];
        this.addItemrouterLink = this.routerLink.split("?")[0];
        // console.log("router-Link-->", this.routerLink);
        if (this.routerLink === "/login"   ||  this.routerLink === "/addnewitem") {

          this.routerLink = "/login";
          
        }
         // console.log("router-Link-->", this.routerLink);
         if (this.routerLink === "/addnewitem"   ) {

          this.addItemrouterLink = "/addnewitem";
          
        }
      }
      
    })
  }

}
