import { Component, OnInit } from '@angular/core';
import { InternalServiceService } from '../Service/internal-service.service';
import { PasServiceService } from '../Service/pas-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.css']
})
export class CartListComponent implements OnInit {
  cartProductList: any;
  grandTotal: number = 0;
  active_customer: any;


  constructor(private _passervice: PasServiceService, private _internalService: InternalServiceService, private router: Router) { }

  ngOnInit(): void {
  }

}
