
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';

// This is the entry point for the AI Studio preview environment.
// The standard Angular build process (`ng build`) uses `src/main.ts`.
// Having the bootstrap logic in both files ensures the app
// works correctly in both the preview and the final deployment.
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection()
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
