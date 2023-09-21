import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { initializeApp } from 'firebase/app';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment.prod';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp } from '@angular/fire/app';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/assets/module/meterial.module';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { SliderComponent } from './components/slider/slider.component';
import { GaugeComponent } from './components/slider/gauge/gauge.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, HomeComponent, SideNavComponent, SliderComponent, GaugeComponent],
  imports: [
    BrowserModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
