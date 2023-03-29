import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
	

@Injectable({
  providedIn: 'root'
})
export class RouteGuardGuard implements CanActivate {


  constructor(private authService: AuthService, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log(this.authService.isLoggedIn());
      
      if (this.authService.isLoggedIn()==false) {
        this.router.navigate(['/login']); // go to login if not authenticated
        return false;
      }
    return true;
  }
  
}
