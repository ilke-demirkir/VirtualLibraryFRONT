// src/app/admin/admin-import.component.ts
import { Component } from '@angular/core';
import { BookImportService } from '../../services/book-importService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-import',
  templateUrl: './admin-import.component.html',
  styleUrls: ['./admin-import.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AdminImportComponent {
  importQuery = '';
  isLoading = false;
  message = '';

  constructor(private api: BookImportService) {}

  onImport(): void {
    const title = this.importQuery.trim();
    if (!title) {
      this.message = 'Please enter a title.';
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.api.importByTitle(title).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = `Successfully imported books for "${title}".`;
      },
      error: err => {
        this.isLoading = false;
        console.error('Import failed', err);
        this.message = 'Import failed – check console for details.';
      }
    });
  }
}

// src/app/admin/admin-import.component.html
/*

*/

// src/app/app-routing.module.ts (add this entry inside your routes array)
/*
import { AdminImportComponent } from './admin/admin-import.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // ... other routes
  {
    path: 'admin/import',
    component: AdminImportComponent,
    canActivate: [AdminGuard]
  }
];
*/

// src/app/admin/admin-import.component.css
/*

*/
