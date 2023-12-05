import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealerComponent } from './dealer.component';

const aboutRoutes: Routes = [
    {path:'', component: DealerComponent},
]

@NgModule({
    imports: [RouterModule.forChild(aboutRoutes)],
    exports: [RouterModule]
  })
  export class DealerRoutingModule { }