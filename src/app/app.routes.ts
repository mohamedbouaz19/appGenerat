import { Routes } from '@angular/router';

import { NotfoundComponent } from './component/notfound/notfound.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {path:'',redirectTo:'/home',pathMatch:'full'},
    {path:'home',component: HomeComponent,title: 'Home'},
    {path:'',component:NotfoundComponent,title: 'Not found'}
];