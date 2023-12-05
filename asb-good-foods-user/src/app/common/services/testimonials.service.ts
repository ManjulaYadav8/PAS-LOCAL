import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Testimonials } from '../models/testimonials.model';

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {

  testimonialData: Testimonials;
  constructor(private firestore: AngularFirestore) { }

  getTestimonialData(){
   return this.firestore.collection('TestimonialManagement', ref => ref.where("testimonialStatus","==","active")).snapshotChanges();
  }
}
