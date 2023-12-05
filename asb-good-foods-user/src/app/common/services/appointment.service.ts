import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  appointmentData: Appointment;
  constructor(public firestore: AngularFirestore) { }

 
   getAppointments(){
    return this.firestore.collection("AppointmentManagements").snapshotChanges();
   }
}
