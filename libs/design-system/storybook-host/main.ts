/**
 * Storybook host entry point.
 *
 * This file exists solely so @angular-devkit/build-angular:browser has a
 * valid entry point to compile against. It is never served directly —
 * Storybook replaces the full page with its own iframe. The build target
 * defined in angular.json only runs during `nx run design-system:storybook`
 * to give the Angular compiler the project context (tsconfig, polyfills, etc.)
 * it needs for story compilation.
 */
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'storybook-root',
  standalone: true,
  template: '',
})
class StorybookRootComponent {}

bootstrapApplication(StorybookRootComponent).catch(console.error);
