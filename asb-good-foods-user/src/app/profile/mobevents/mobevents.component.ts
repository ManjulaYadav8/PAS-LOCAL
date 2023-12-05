import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Appointment } from 'src/app/common/models/appointment.model';

@Component({
  selector: 'app-mobevents',
  templateUrl: './mobevents.component.html',
  styleUrls: ['./mobevents.component.css']
})
export class MobeventsComponent implements OnInit {

  userUid;
  eventList: Appointment[];
  eventId;
  constructor(private firestore: AngularFirestore, private router: Router) { }

  ngOnInit() {
    this.getUseruid();
    this.getEventList();
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
  getUseruid() {
    this.userUid = JSON.parse(localStorage.getItem('userid'));
  }
  getEventList(){
    this.firestore.collection("AppointmentManagements", ref => ref.where("userUid","==",this.userUid)).get().subscribe(event=>{
      this.eventList = event.docs.map(list =>{
        return{
          appointmentDocId: list.id,
                          ...list.data() as {}
        }as Appointment
      })
      this.eventId = this.eventList.length;
    })
  }
  viewEventDetails(event){
    this.router.navigate(['/profile',event.appointmentDocId],{queryParams : {'type' : 'Event'}});
  }
}
