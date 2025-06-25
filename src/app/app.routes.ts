import { Routes } from '@angular/router';

export const routes: Routes = [
    {   
        path:"",
        redirectTo: "home",
        pathMatch: "full"
    },
    {
        path: "home",
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: "books/add",
        loadComponent: () => import('./components/add-book/add-book.component').then(m => m.AddBookComponent)
    }
];
