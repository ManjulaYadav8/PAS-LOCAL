import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlogOverviewComponent } from './blog-overview/blog-overview.component';
import { BlogComponent } from './blog.component';

const routes: Routes = [
  {path:'', component:BlogComponent},
  {path:'blog/:id', component:BlogOverviewComponent},
  {path:':id', component: BlogOverviewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
