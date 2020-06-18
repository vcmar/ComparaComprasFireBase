import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './common/app-routing/app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { HomeComponent } from './common/home/home.component';

import { PathResolverService } from './services/path-resolver.service';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './common/navbar/navbar.component';
import { LoginComponent } from './common/login/login.component';
import { AdminCategoriesComponent } from './admin/admin-categories/admin-categories.component';
import { AdminBrandsComponent } from './admin/admin-brands/admin-brands.component';
import { AdminPackagesComponent } from './admin/admin-packages/admin-packages.component';
import { AdminPlacesComponent } from './admin/admin-places/admin-places.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';

import { UserPlacesComponent } from './user/user-places/user-places.component';
import { UserProductsComponent } from './user/user-products/user-products.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { NotAuthorizedComponent } from './common/not-authorized/not-authorized.component';

import { UserPlacesFormComponent } from './user/user-places-form/user-places-form.component';
import { UserProductsFormComponent } from './user/user-products-form/user-products-form.component';
import { AppToastComponent } from './common/app-toast/app-toast.component';
import { ProductCardComponent } from './common/product-card/product-card.component';
import { BooleanPipe } from './pipes/boolean.pipe';
import { UserPurchaseFormComponent } from './user/user-purchase-form/user-purchase-form.component';
import { HttpClientModule } from '@angular/common/http';
import { TestsComponent } from './admin/tests/tests.component';
import { AdminProductsFormComponent } from './admin/admin-products-form/admin-products-form.component';
import { ProductFormComponent } from './common/product-form/product-form.component';
import { BrandFormComponent } from './common/brand-form/brand-form.component';
import { ProductSearchComponent } from './common/product-search/product-search.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductTableComponent } from './common/product-table/product-table.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SearchPopupComponent } from './common/search-popup/search-popup.component';
import { AboutComponent } from './common/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    HomeComponent,
    NavbarComponent,
    LoginComponent,
    AdminCategoriesComponent,
    AdminBrandsComponent,
    AdminPackagesComponent,
    AdminPlacesComponent,
    AdminProductsComponent,
    AdminUsersComponent,
    UserPlacesComponent,
    UserProductsComponent,
    UserDashboardComponent,
    NotAuthorizedComponent,
    UserPlacesFormComponent,
    UserProductsFormComponent,
    AppToastComponent,
    ProductCardComponent,
    BooleanPipe,
    UserPurchaseFormComponent,
    TestsComponent,
    AdminProductsFormComponent,
    ProductFormComponent,
    BrandFormComponent,
    ProductSearchComponent,
    ProductTableComponent,
    SearchPopupComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    NgbModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    FontAwesomeModule,
    LeafletModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [PathResolverService],
  bootstrap: [AppComponent],
  entryComponents: [ProductFormComponent, BrandFormComponent, SearchPopupComponent]
})
export class AppModule { }
