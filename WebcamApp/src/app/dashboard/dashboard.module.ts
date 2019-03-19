import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

import { MatCardModule } from '@angular/material';
import { CovalentLayoutModule } from '@covalent/core';

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, DashboardRoutingModule, CovalentLayoutModule, MatCardModule]
})
export class DashboardModule {}
