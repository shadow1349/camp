import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

import { MatCardModule } from '@angular/material';
import { CovalentLayoutModule } from '@covalent/core';

@NgModule({
  declarations: [MainComponent],
  imports: [CommonModule, MainRoutingModule, CovalentLayoutModule, MatCardModule]
})
export class MainModule {}
