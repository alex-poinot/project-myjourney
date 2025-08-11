# Documentation Technique FrontEnd - MyJourney

## 📋 Vue d'ensemble du projet

**MyJourney** est une application web Angular standalone développée pour Grant Thornton, permettant la gestion des livrables des missions du métier EC.

## 🏗️ Architecture générale

### Stack technologique
- **Frontend**: Angular 20 (Standalone Components)
- **Authentification**: Azure AD avec MSAL
- **UI Framework**: Angular Material
- **PDF Generation**: jsPDF + html2canvas
- **Drag & Drop**: Angular CDK
- **Build Tool**: Angular CLI

### Structure du projet
```
src/
├── auth/                    # Configuration authentification
├── components/              # Composants Angular standalone
├── guards/                  # Guards de routage
├── models/                  # Interfaces TypeScript
├── services/                # Services métier
├── global_styles.css        # Styles globaux
├── index.html              # Point d'entrée HTML
└── main.ts                 # Bootstrap de l'application
```

## 🧩 Architecture des composants

### Composants standalone
Tous les composants utilisent l'architecture standalone d'Angular 20 :
```typescript
@Component({
  selector: 'app-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `...`,
  styles: [`...`]
})
```

## 📊 Gestion des données

### Modèles de données
```typescript
// Module interface
export interface BaseModule {
  id: string;
  type: 'text' | 'image' | 'table' | 'title' | 'subtitle';
  order: number;
}

// Types spécialisés
export type Module = TextModule | ImageModule | TableModule | TitleModule | SubtitleModule;
```

### État de l'application
- **BehaviorSubject**: Gestion réactive des modules
- **Observables**: Communication entre composants
- **Session Storage**: Persistance des tokens d'authentification

## 🎨 Système de design

### Variables CSS personnalisées
```css
:root {
  --primary-color: #226D68;
  --secondary-color: #64CEC7;
  --gray-50: #f9fafb;
  /* ... autres variables */
}
```

### Composants UI réutilisables
- **Cards**: `.card`, `.card-header`, `.card-body`
- **Boutons**: `.btn-primary`, `.btn-secondary`, `.btn-outline`
- **Badges**: `.badge-primary`, `.badge-success`, etc.
- **Inputs**: `.form-input` avec focus states

### Responsive Design
- **Mobile First**: Breakpoints à 768px et 1200px
- **Flexbox**: Layout principal avec flex
- **Grid**: Tableaux et grilles de données

## 🔄 Drag & Drop (NOG Editor)

### Angular CDK Drag Drop
```typescript
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

onModuleDrop(event: CdkDragDrop<any[]>): void {
  if (event.previousContainer === event.container) {
    // Réorganisation
    moveItemInArray(sortedModules, event.previousIndex, event.currentIndex);
  } else {
    // Ajout nouveau module
    this.moduleService.addModule(template.type);
  }
}
```

### Zones de drop connectées
- **Sidebar**: Templates de modules
- **Editor**: Zone d'édition des modules
- **Connected Lists**: Communication entre les zones

## 🚀 Build et déploiement

### Configuration Angular
```json
// angular.json
{
  "build": {
    "builder": "@angular/build:application",
    "options": {
      "outputPath": "dist/demo",
      "index": "src/index.html",
      "browser": "src/main.ts",
      "polyfills": ["zone.js"],
      "styles": ["src/global_styles.css"]
    }
  }
}
```

### Scripts disponibles
```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build"
  }
}
```

## 🔧 Configuration développement

### Prérequis
- Node.js 18+
- Angular CLI 20+
- Compte Azure AD configuré

### Variables d'environnement
- **MSAL Configuration**: Directement dans `auth.config.ts`
- **URLs de redirection**: `http://localhost:4200/`

### Démarrage local
```bash
npm install
ng serve
# Application disponible sur http://localhost:4200
```