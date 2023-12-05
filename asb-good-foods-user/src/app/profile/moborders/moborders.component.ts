import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { Cart } from 'src/app/common/models/cart.model';
import { Order } from 'src/app/common/models/order.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';

@Component({
  selector: 'app-moborders',
  templateUrl: './moborders.component.html',
  styleUrls: ['./moborders.component.css']
})
export class MobordersComponent implements OnInit {
  
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  userUid;
  orderItems: Order[];
  orderItemsData;
  config;
  orderItemsDataList:Order[];
  orderDocId;
  orderId = 0;
  reOrdering;
  sortVariable="Order Id";
  searchString = "";
  cartItemsList: Cart[];
  alertMessages: AlertMessage[];
  constructor(private firestore: AngularFirestore, private router: Router, private toastr: ToastrService,
    private analyticsService : AnalyticsService,private alertMsgService: AlertMessageService) { }

  ngOnInit() {
    this.getUseruid();
    this.getOrderItems();
    this.getAlertMessages();
    this.config = {
      id: 'custom',
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: 4
    };
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
    document.body.scrollTop = 10; // For Safari
    document.documentElement.scrollTop = 10; // For Chrome, Firefox, IE and Opera

  }
  getOrderItems() {
    this.firestore.collection('Order', ref => ref.where('userId', '==', this.userUid)).snapshotChanges().subscribe(data => {
      this.orderItems = data.map(item => {
        return {
          orderItemDocId: item.payload.doc.id,
          ...item.payload.doc.data() as {}
        } as Order;
      })
      // console.log(this.orderItems)
      // this.productMatList = new MatTableDataSource(this.orderItems);
      this.orderItems.sort((a, b) => Number(new Date(b.date).getTime()) - Number(new Date(a.date).getTime()));
      // for(var i = 0; i < this.orderItems.length; i++){
      //   this.orderDocId.push(this.orderItems[i].orderItemDocId);
      // }
      // this.getOrderItemsList();
      this.getSeparateOrderItems(this.orderItems)
    })

  }
  continueShopping(){
    this.router.navigate(['/products']);
    this.topFunction();
  }
  // onSearchClear(){
  //   this.searchKey = "";
  //   this.applyFilter();
  // }
  // applyFilter(){
  //   this.productMatList.filter = this.searchKey.trim().toLowerCase();
  //   console.log(this.productMatList.filter)
  // }
  getSeparateOrderItems(orderItems) {
    this.orderItemsData = orderItems;
    this.config = {
      id: 'custom',
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: this.orderItemsData.length
    };
    this.orderId = this.orderItemsData.length;
  }

  // getOrderItemsList() {
  //   for (var i = 0; i < this.orderDocId.length; i++) {
  //     this.firestore.collection('Order').doc(this.orderDocId[i]).collection('OrderItems').snapshotChanges().subscribe(order => {
  //       this.orderItemsDataList = order.map(list => {
  //         return {
  //           orderDocId: list.payload.doc.id,
  //           ...list.payload.doc.data() as {}
  //         } as Order;
  //       })
  //       for (var j = 0; j < this.orderItemsDataList.length; j++) {
  //         this.orderItemsData.push(this.orderItemsDataList[j]);
  //       }
  //     })
  //   }
  // }
  viewOrderDetails(order){
  //  console.log(order);
   this.router.navigate(['/profile',order.orderItemDocId],{queryParams : {'type' : 'Order'}});
  }
  getUseruid() {
    this.userUid = JSON.parse(
      localStorage.getItem('userid')
    );
  }
  reorder(reorder){
    //  console.log(reorder);
     this.reOrdering = reorder;
     this.getCartItemsList();
    }
    getCartItemsList() {
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').snapshotChanges().subscribe(cart => {
        this.cartItemsList = cart.map(list => {
          return {
            CartDocId: list.payload.doc.id,
            ...list.payload.doc.data()
          } as Cart;
        });
        // console.log(this.cartItemsList);
      })
    }
    cartUpdate(){
      if(this.reOrdering){
        this.reOrdering.map(product => {
          if(product){
            var analyticsData = {
              "source" : "reorder",
              "category-name" : product.categoryName,
              "quantity" : product.quantity,
              "current-stock" : product.currentStock,
              "initial-stock" : product.initialStock,
              "product_name" : product.productName,
              "product-price" : product.productPrice,
              "product-doc-id" : product.productdocId,
            }
            this.analyticsService.setEcommerceEvent('e-commerce','add-to-cart',analyticsData);
          }
        })
      }
      for(var i=0; i<this.reOrdering.length; i++){
        const obj = this.cartItemsList.find(o => o.productdocId === this.reOrdering[i].productdocId);
        this.reOrdering[i].orderStatus = "Open";
        if (this.userUid && obj == undefined) {
        this.firestore.collection('Cart').doc(this.userUid).collection('Cart').add(this.reOrdering[i])
        .then(docRef => {
          let cartDocId = docRef.id;
          //// console.log( "Add" +this.cartDocId);
          this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${cartDocId}`).update({ "CartDocId": cartDocId });
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
        if( i === 0){
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
          var alertMsg = productAlert.alertMsgType;
          this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
        }
      }else{
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({ 'quantity': (obj.quantity) + 1 })
        if( i === 0){
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
      }
      }
       }
    }
    orderIdselect(finalData) {
      this.sortVariable = "Order Id";
      finalData.sort((a, b) => Number(b.orderId) - Number(a.orderId));
    }
  
    date(finalData) {
      this.sortVariable = "Date";
      finalData.sort((a, b) => Number(new Date(b.date).getTime()) - Number(new Date(a.date).getTime()));
    }
    hightolow(finalData){
      this.sortVariable = "HighToLow";
      finalData.sort((a, b) => Number(b.total) - Number(a.total));
     }
     lowtohigh(finalData){
       this.sortVariable = "LowToHigh";
       finalData.sort((a, b) => Number(a.total) - Number(b.total));
     }
}
