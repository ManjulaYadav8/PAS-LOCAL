import { Component, OnInit , Input, OnChanges,  ViewChild, ElementRef, EventEmitter, Output, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { BehaviorSubject, Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { MatTableDataSource, MatSort, MatPaginator, MatChipInputEvent, MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';
import { CartService } from 'src/app/common/services/cart.service';
import { CategoryService } from 'src/app/common/services/category.service';
import { CouponService } from 'src/app/common/services/coupon.service';
import { ProductService } from 'src/app/common/services/product.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';



@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent implements OnInit,OnChanges  {

  couponList : any[];
  // appliedCoupon : any[] = [];
  invalidCoupon = false;
  checked = false;
  count = 0;
  couponCount = 0;
  warnMsg = '';

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  couponCtrl = new FormControl();
  filteredCoupons: Observable<string[]>;
  appliedCoupon: any[] = [];
  allCoupons: any[] = [];
  companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  @ViewChild('couponInput',{static : true}) couponInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto',{static : true}) matAutocomplete: MatAutocomplete;

  @Input('cart') cart = [];
  @Output() addCoupon = new EventEmitter<any>();
  @Output() removeCoupon = new EventEmitter<any>();
  constructor(public couponService : CouponService,
    public categoryService : CategoryService,
    private analyticsService : AnalyticsService,
    private cartService: CartService,
    public productService : ProductService) { 

      // this.filteredCoupons = this.couponCtrl.valueChanges.pipe(
      //   startWith(null),
      //   map((coupon: string | null) => coupon ? this._filter(coupon) : this.allCoupons.slice()));
  
    }

  ngOnInit() {
    this.getCartCouponList();
  }
  ngOnChanges() {
    if(this.cart && this.count == 0){
      this.count++;
      this.getCouponsCategoryType(this.cart);
    }
  }

  getCartCouponList(){
    this.cartService.getCartCoupons().subscribe(res => {
      if(res.payload.exists && res.payload.data()["coupons"]){
          this.appliedCoupon = res.payload.data()["coupons"];
      }
    })
}

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || '').trim();

    // Add our coupon
    if (value) {
      this.applyCoupon(value)
    }

    // Clear the input value
    if (input) {
      input.value = '';
    }

    this.couponCtrl.setValue(null);
  }

  remove(coupon: any): void {
    const index = this.appliedCoupon.indexOf(coupon);

    if (index >= 0) {
      this.appliedCoupon.splice(index, 1);
      this.removeCoupon.emit(coupon);
      // console.log(coupon);
    }
    this.warnMsg = '';
  }

  // selected(event: MatAutocompleteSelectedEvent): void {
  //   this.appliedCoupon.push(event.option.viewValue);
  //   this.couponInput.nativeElement.value = '';
  //   this.couponCtrl.setValue(null);
  // }

  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();

  //   return this.allCoupons.filter(coupon => coupon.toLowerCase().indexOf(filterValue) === 0);
  // }

  clearMsg(){
    this.warnMsg = '';
  }

  getCouponsCategoryType(cart){
    this.couponList = [];
    cart.map(item => {
      this.categoryService.getCategory(item.categoryDocId).subscribe(res => {
        if(res.exists && res.data() && res.data() && res.data().couponIds){
          var couponIds = res.data().couponIds;
           couponIds.map(couponId => {
            this.checkValidation(couponId,null);
          })
        }
      })
      this.productService.getProduct(item.productdocId).subscribe(res => {
        if(res.exists && res.data() && res.data().couponIds){
          var couponIds = res.data().couponIds;
           couponIds.map(couponId => {
            this.checkValidation(couponId,item.productdocId);
          })
        }
      })
    })
    this.couponService.getCouponByType('SITE WIDE').then(res => {
      res.docs.map(res => {
        if(res.data()){
           this.checkValidation(res.data()["couponId"],null);
        }
      })
    })
  }

  checkValidation(couponId,productId){
    this.couponService.getCoupon(couponId).subscribe(res => {
      if(res.data() && res.data()["status"] === true){
        var expiryDate = parseInt(new Date(res.data()["couponExpiryDate"]).toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[1]);
        var currentDate = parseInt(new Date().toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[1]);
        if(expiryDate >= currentDate){
          if(productId){
            if(this.couponList && this.couponList.length){
              var multiProduct = this.couponList.filter(coupon => coupon.couponId === couponId)[0];
              if(multiProduct && multiProduct.productId != undefined && multiProduct.productId.length){
                const index = this.couponList.indexOf(multiProduct);
                this.couponList.splice(index, 1);
                var productIds = [...multiProduct.productId,productId];
                this.couponList.push(Object.assign({ "productId" : productIds },res.data()));
              }
            }else{
              this.couponList.push(Object.assign({ "productId" : [productId] },res.data()));
            }
          }else{
            this.couponList.push(Object.assign({ "productId" : productId },res.data()));
          }
        }
      } 
    })
  }
  applyCoupon(couponCode){
    this.warnMsg = '';
    var coupon =  this.couponList.filter(coupon => coupon.couponCode.toLowerCase() === couponCode.toLowerCase())[0];
    if(coupon){
      var duplicate =  this.appliedCoupon.filter(coupon => coupon.couponCode.toLowerCase() === couponCode.toLowerCase());
      if(duplicate.length){
        this.warnMsg = "Alread Coupon Added!";
      }else{
        if(coupon.maxUsageLimit == null || coupon.maxUsageLimit > 0){
          if(coupon.productId != null && coupon.productId.length){
              var productQty = Math.max(...this.cart.map(item => {
                if(coupon.productId.includes(item.productdocId)){
                  return item.quantity;
                }
              }));
              if(coupon.maxQtyAllowed == null || coupon.maxQtyAllowed >= productQty){
                this.maxComboValidation(coupon);
              }else{
                this.warnMsg = "Max Allowed Qty Exceeded!";
              }
          }else{
            this.maxComboValidation(coupon);
          }
        }
        else{
          this.warnMsg = "Coupon Usage Limit Exceeded!";
        }
      }
    }else{
      this.warnMsg = "Invalid Coupon!";
    }
  }
  maxComboValidation(coupon){
    this.invalidCoupon = false;
    if(this.appliedCoupon.length === 0){
      this.appliedCoupon = [...this.appliedCoupon,coupon];
      this.addCoupon.emit(coupon);
      this.addApplyPromotion(coupon);
    }else{
      var maxComboQty =  Math.min(...[...this.appliedCoupon,coupon].map(coupon => coupon.maxComboQty));
      if((this.appliedCoupon.length + 1) <= maxComboQty){
        this.appliedCoupon = [...this.appliedCoupon,coupon];
        this.addCoupon.emit(coupon);
        this.addApplyPromotion(coupon);
      }else{
        this.warnMsg = `Maximum Coupon Quota Exceeded!`;
      }
    }
  }
  addApplyPromotion(coupon){
    this.analyticsService.setEcommerceEvent('e-commerce','add-promotion',coupon);
  }
} 
