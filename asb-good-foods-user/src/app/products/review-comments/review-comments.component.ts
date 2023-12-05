import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { Review } from 'src/app/common/models/review.model';

@Component({
  selector: 'app-review-comments',
  templateUrl: './review-comments.component.html',
  styleUrls: ['./review-comments.component.css']
})
export class ReviewCommentsComponent implements OnInit {

  reviewList: Review[];
  productDocId;
  starRatings = [];
  starRating = [];
  avgRating = 0;
  unpilledStarCount =0;
  unpilledStar = [];
  sortVariable="Reviews";
  filteredData;
  imageUrl;
  enabledReviewList = [];
  activeSlides: SlidesOutputData;
  customOptions: OwlOptions = {
    loop: true,
    margin: 20,
    autoplay: true,
    autoplaySpeed: 1000,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ["<div class='btn btn-sm btn-success nextSlide'><</div>", "<div class='btn btn-sm btn-success nextSlide'>></div>"],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
    nav: true,
    autoplayHoverPause:true
  }
  constructor(public dialogRef: MatDialogRef<ReviewCommentsComponent>,private firestore: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.productDocId = this.data.data;
    this.getReviews();
  }
  getPassedData(data: SlidesOutputData) {
    this.activeSlides = data;
  }
  // getReviews(){
  //   //// console.log(this.productDocId)
  //   this.firestore.collection('Review').doc(`${this.productDocId}`).collection('ReviewComments', ref => ref.where("reviewStatus","==","enable")).snapshotChanges().subscribe(review =>{
  //    this.reviewList = review.map(list =>{
  //      return{
  //       reviewDocId: list.payload.doc.id,
  //       ... list.payload.doc.data()
  //      }as Review;     
  //    })
  //   // console.log(this.reviewList)
  //   // this.getSelectedProdRatings(this.reviewList)
  //   });
  // }
  getReviews() {
    this.firestore.collection('Review').doc(`${this.productDocId}`).collection('ReviewComments', ref => ref.where("reviewStatus", "==","enable")).get().subscribe(review => {
      this.reviewList = review.docs.map(list => {
        return {
          reviewDocId: list.id,
          ...list.data()
        } as Review;
      })
    });
  }
  getSelectedProdRatings(reviewList){
    // this.filteredData = reviewList.sort((a, b) => Number(b.ratings) - Number(a.ratings));
    for(var i=0; i<this.reviewList.length; i++){
      if(this.reviewList[i].reviewStatus == 'enable'){
        this.enabledReviewList.push(this.reviewList[i]);
      }
    }
    for(var i=0; i<reviewList.length; i++){
      this.starRatings = [];
      for(var j=0; j<reviewList[i].ratings; j++){
        this.starRatings.push(j);
      }
    }
    this.starRating = [];
    this.avgRating = 0;
    this.unpilledStarCount = 0;
    for(var i=0; i<reviewList.length; i++){
      this.starRating.push(reviewList[i].ratings);
      let avgTotal = this.starRating.reduce((total, val)=> total+ val)/ reviewList.length;
        this.avgRating = Math.round(avgTotal);
     this.unpilledStarCount = 5-this.avgRating;
    }
    this.starRating = [];
    for(var i=0; i<this.avgRating; i++){
      this.starRating.push(i);
    }
    this.unpilledStar = [];
    for(var i=0; i<this.unpilledStarCount; i++){
     this.unpilledStar.push(i);
    }
  }
  onClose(){
    this.dialogRef.close();
  }
  rating(enabledReviewList) {
    this.sortVariable = "Rating";
    enabledReviewList.sort((a, b) => Number(b.ratings) - Number(a.ratings));
  }

  date(enabledReviewList) {
    this.sortVariable = "Date";
    enabledReviewList.sort((a,b)=> Number(b.reviewId) - Number(a.reviewId));
  }
  // fullImage(imageUrl){
  //  this.imageUrl = imageUrl;
  // }
}
