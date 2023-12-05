import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact.component';

const aboutRoutes: Routes = [
    {path:'',component: ContactComponent},
]

@NgModule({
    imports: [RouterModule.forChild(aboutRoutes)],
    exports: [RouterModule]
  })
  export class ContactRoutingModule { }

