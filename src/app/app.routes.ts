import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
export const routes: Routes = [
    {   
        path:"",
        redirectTo: "home",
        pathMatch: "full"
    },
    {
        path: "books",
        children: [
            {
                path: "add",
                loadComponent: () => import('./components/add-book/add-book.component').then(m => m.AddBookComponent),
                canActivate: [AuthGuard] // Assuming you have an AuthGuard implemented
            },
            {
                path: "edit/:id",
                loadComponent: () => import('./components/edit-book/edit-book.component').then(m => m.EditBookComponent),
                canActivate: [AuthGuard] // Assuming you have an AuthGuard implemented
            },
            {
                path: "list",
                loadComponent: () => import('./components/list-books/list-books.component').then(m => m.ListBooksComponent)
            },
            {
                path: ":id",
                loadComponent: () => import('./components/book-detail/book-detail.component').then(m => m.BookDetailComponent)
            }
        ]
    },
    {
        path: "home",
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: "login",
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: "register",
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: "admin-import",
        loadComponent: () => import('./components/admin-import/admin-import.component').then(m => m.AdminImportComponent),
        canActivate: [AuthGuard] // Assuming you have an AuthGuard implemented
    },
    {
        path: "favorites",
        loadComponent: () => import('./components/favorites/favorites.component').then(m => m.FavoritesComponent)
    },
    {
        path: "cart",
        loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent),
        canActivate: [AuthGuard] 
    },
    {
        path: "checkout",
        loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    },
    {
        path: "checkout-success",
        loadComponent: () => import('./components/checkout-success/checkout-success.component').then(m => m.CheckoutSuccessComponent),
    },
    { 
        path: 'orders',          
        loadComponent: () => import('./components/order-history/order-history.component').then(m => m.OrderHistoryComponent), 
        canActivate:[AuthGuard] },
    { 
        path: 'orders/:id',      
        loadComponent: () => import('./components/order-detail/order-detail.component').then(m => m.OrderDetailComponent),   
        canActivate:[AuthGuard] },



    
    

];

