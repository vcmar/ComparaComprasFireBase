import { AboutComponent } from './../about/about.component';
import { AdminProductsFormComponent } from './../../admin/admin-products-form/admin-products-form.component';
import { TestsComponent } from './../../admin/tests/tests.component';
import { UserPurchaseFormComponent } from './../../user/user-purchase-form/user-purchase-form.component';
import { UserProductsFormComponent } from './../../user/user-products-form/user-products-form.component';
import { UserPlacesFormComponent } from './../../user/user-places-form/user-places-form.component';
import { UserProductsComponent } from './../../user/user-products/user-products.component';
import { UserPlacesComponent } from './../../user/user-places/user-places.component';
import { UserDashboardComponent } from './../../user/user-dashboard/user-dashboard.component';
import { AdminUsersComponent } from './../../admin/admin-users/admin-users.component';
import { AdminProductsComponent } from './../../admin/admin-products/admin-products.component';
import { AdminPlacesComponent } from './../../admin/admin-places/admin-places.component';
import { AdminPackagesComponent } from './../../admin/admin-packages/admin-packages.component';
import { AdminCategoriesComponent } from './../../admin/admin-categories/admin-categories.component';
import { AdminBrandsComponent } from './../../admin/admin-brands/admin-brands.component';
import { LoginComponent } from './../login/login.component';
import { HomeComponent } from './../home/home.component';
import { NotFoundComponent } from './../not-found/not-found.component';
import { NotAuthorizedComponent } from './../not-authorized/not-authorized.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

/* Routes */
import { paths } from './app.paths';
import { PathResolverService } from 'src/app/services/path-resolver.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { AuthGuardAdminService } from 'src/app/services/auth-guard-admin.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: paths.home },
  { path: paths.home, component: HomeComponent },
  { path: paths.login, component: LoginComponent },
  { path: paths.about, component: AboutComponent },
  { path: paths.notAuthorized, component: NotAuthorizedComponent },

  /* User Routes */
  { path: paths.userDashboard, component: UserDashboardComponent, canActivate: [AuthGuardService] },
  { path: paths.userPlacesNew, component: UserPlacesFormComponent, canActivate: [AuthGuardService] },
  { path: paths.userPlacesEdit, component: UserPlacesFormComponent, canActivate: [AuthGuardService] },
  { path: paths.userPlaces, component: UserPlacesComponent, canActivate: [AuthGuardService] },
  { path: paths.userProductsNew, component: UserProductsFormComponent, canActivate: [AuthGuardService] },
  { path: paths.userProductsEdit, component: UserProductsFormComponent, canActivate: [AuthGuardService] },
  { path: paths.userProducts, component: UserProductsComponent, canActivate: [AuthGuardService] },
  { path: paths.userPurchaseNew, component: UserPurchaseFormComponent, canActivate: [AuthGuardService] },
  { path: paths.userPurchaseEdit, component: UserPurchaseFormComponent, canActivate: [AuthGuardService] },

  /* Admin Routes */
  { path: paths.adminBrands, component: AdminBrandsComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },
  { path: paths.adminCategories, component: AdminCategoriesComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },
  { path: paths.adminPackages, component: AdminPackagesComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },
  { path: paths.adminPlaces, component: AdminPlacesComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },
  { path: paths.adminProductsNew, component: AdminProductsFormComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },
  { path: paths.adminProductsEdit, component: AdminProductsFormComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },
  { path: paths.adminProducts, component: AdminProductsComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },
  { path: paths.adminUsers, component: AdminUsersComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },

  { path: paths.adminTest, component: TestsComponent, canActivate: [AuthGuardService, AuthGuardAdminService] },

  { path: '**', resolve: { path: PathResolverService }, component: NotFoundComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
