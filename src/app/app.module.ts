import { NgModule, LOCALE_ID } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { MatriceComponent } from './pages/matrice/matrice.component';
import { ReverseArrayPipe } from './pages/matrice/template/reverse-array.pipe';
import { PosteComponent } from './pages/matrice/template/poste/poste.component';
import { RangerComponent } from './pages/matrice/template/ranger/ranger.component';
import { ZoneComponent } from './pages/matrice/template/zone/zone.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { ParamMapComponent } from './pages/matrice/param-map/param-map.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomTooltipComponent } from './pages/matrice/custom-tooltip/custom-tooltip.component';
import { registerLocaleData } from '@angular/common';
import * as fr from '@angular/common/locales/fr';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SideNavComponent,
    SliderComponent,
    GaugeComponent,
    MatriceComponent,
    ReverseArrayPipe,
    PosteComponent,
    RangerComponent,
    ZoneComponent,
    ParamMapComponent,
    CustomTooltipComponent,
  ],
  imports: [
    BrowserModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    MatTabsModule,
    MatGridListModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(fr.default);
  }
}
