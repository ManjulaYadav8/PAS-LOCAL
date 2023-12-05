import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-mobprofile',
  templateUrl: './mobprofile.component.html',
  styleUrls: ['./mobprofile.component.css']
})
export class MobprofileComponent implements OnInit {

  userUid;
  userList;
  editProfile;
  constructor(private firestore: AngularFirestore) { }

  ngOnInit() {
    this.getUseruid();
    this.getUserItems();
  }
  getUseruid() {
    this.userUid = JSON.parse(
      localStorage.getItem('userid')
    );
  }
  getUserItems() {
    this.firestore.collection('User').doc(`${this.userUid}`).snapshotChanges().subscribe(order => {
      this.userList = order.payload.data();
      this.editProfile = this.userList.profileUrl;
    })
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
}
