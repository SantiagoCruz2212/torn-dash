# Torn Dash - Dashboard para Torn City

Dashboard interactivo y moderno para Torn City con soporte integrado para múltiples redes publicitarias.

## Características

- 🎨 **Diseño Dark/Cyberpunk**: Interfaz moderna con tema oscuro y efectos neón
- 📱 **Responsive**: Totalmente adaptable a dispositivos móviles y desktop
- 🎯 **6 Vistas Principales**:
  - Dashboard Principal
  - Travel Radar
  - Company Manager
  - Merit Hunter
  - Stock ROI
  - Faction War Room
- 💰 **Integración Publicitaria**: Soporte para Google AdSense, Adsterra y PropellerAds
- ⚡ **Arquitectura Escalable**: Componentes standalone con lazy loading
- 🎨 **Tailwind CSS**: Estilos personalizados con utilidades de Tailwind

## Tecnologías

- **Angular 19**: Framework principal
- **Tailwind CSS 3**: Framework de estilos
- **TypeScript**: Lenguaje de programación
- **Standalone Components**: Arquitectura moderna de Angular

## Instalación

```bash
cd torn-dash
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

## Build

```bash
npm run build
```

Los archivos compilados estarán en `dist/torn-dash/`

## Arquitectura del Proyecto

```
src/app/
├── core/              # Servicios singleton y lógica core
│   ├── services/      # Servicios (AdService)
│   ├── guards/        # Guards de rutas
│   └── interceptors/  # HTTP interceptors
├── shared/            # Componentes compartidos
│   ├── components/    # Componentes reutilizables
│   │   ├── ad-banner/ # Componente de banner publicitario
│   │   └── ad-box/    # Componente de caja publicitaria
│   ├── pipes/         # Pipes personalizadas
│   └── directives/    # Directivas personalizadas
├── features/          # Módulos de funcionalidad
│   ├── dashboard/     # Vista principal
│   ├── travel-radar/  # Vista de radar de viajes
│   ├── company-manager/ # Vista de gestión de compañías
│   ├── merit-hunter/  # Vista de cazador de méritos
│   ├── stock-roi/     # Vista de análisis de acciones
│   └── faction-war-room/ # Vista de sala de guerra
└── layout/            # Componentes de layout
    └── components/
        ├── sidebar/   # Barra lateral de navegación
        └── header/    # Encabezado con API key input
```

## Integración de Publicidad

El proyecto incluye soporte completo para tres redes publicitarias:

### Google AdSense

#### 1. Inicializar AdSense

En `app.component.ts` o en tu componente principal:

```typescript
import { AdService } from './core/services/ad.service';

export class AppComponent implements OnInit {
  constructor(private adService: AdService) {}

  ngOnInit() {
    // Reemplaza con tu ID de cliente de AdSense
    this.adService.initializeAdSense('ca-pub-XXXXXXXXXXXXXXXX');
  }
}
```

#### 2. Usar el componente AdBanner

```html
<app-ad-banner
  provider="adsense"
  client="ca-pub-XXXXXXXXXXXXXXXX"
  slot="XXXXXXXXXX"
  format="auto"
  height="90px">
</app-ad-banner>
```

#### 3. Usar el componente AdBox

```html
<app-ad-box
  provider="adsense"
  client="ca-pub-XXXXXXXXXXXXXXXX"
  slot="XXXXXXXXXX"
  format="auto"
  minHeight="300px">
</app-ad-box>
```

### Adsterra

#### 1. Inicializar Adsterra

```typescript
ngOnInit() {
  this.adService.initializeAdsterra('YOUR_SCRIPT_ID');
}
```

#### 2. Usar el componente

```html
<app-ad-banner
  provider="adsterra"
  scriptId="YOUR_SCRIPT_ID"
  height="90px">
</app-ad-banner>
```

### PropellerAds

#### 1. Inicializar PropellerAds

```typescript
ngOnInit() {
  this.adService.initializePropellerAds('YOUR_SCRIPT_ID');
}
```

#### 2. Usar el componente

```html
<app-ad-box
  provider="propellerads"
  scriptId="YOUR_SCRIPT_ID"
  minHeight="300px">
</app-ad-box>
```

## Componentes de Publicidad

### AdBannerComponent

Componente para banners publicitarios horizontales.

**Props:**
- `provider`: `'adsense' | 'adsterra' | 'propellerads'` - Red publicitaria
- `client`: `string` - ID de cliente (solo AdSense)
- `slot`: `string` - ID de slot (solo AdSense)
- `format`: `string` - Formato del anuncio (default: 'auto')
- `scriptId`: `string` - ID del script (Adsterra/PropellerAds)
- `height`: `string` - Altura del banner (default: '90px')
- `responsive`: `boolean` - Si el anuncio es responsive (default: true)

### AdBoxComponent

Componente para anuncios en formato de caja vertical.

**Props:**
- `provider`: `'adsense' | 'adsterra' | 'propellerads'` - Red publicitaria
- `client`: `string` - ID de cliente (solo AdSense)
- `slot`: `string` - ID de slot (solo AdSense)
- `format`: `string` - Formato del anuncio (default: 'auto')
- `scriptId`: `string` - ID del script (Adsterra/PropellerAds)
- `minHeight`: `string` - Altura mínima de la caja (default: '300px')
- `responsive`: `boolean` - Si el anuncio es responsive (default: true)

## Personalización de Estilos

Los colores del tema se definen en `tailwind.config.js`:

```javascript
colors: {
  'primary': '#0df259',      // Verde neón
  'primary-dark': '#0ab842',
  'accent': '#f25c0d',       // Naranja
  'background-dark': '#0a0f0d',
  'surface-dark': '#161b18',
  'surface-border': '#2a3830',
  'text-muted': '#8ca395',
}
```

## Próximas Vistas a Implementar

Las siguientes vistas tienen componentes creados pero requieren implementación:

- ✅ Dashboard (Completado)
- ⏳ Travel Radar
- ⏳ Company Manager
- ⏳ Merit Hunter
- ⏳ Stock ROI
- ⏳ Faction War Room

## Configuración de API

La aplicación incluye un campo en el header para ingresar tu API key de Torn City. Puedes modificar el comportamiento de guardado en `header.component.ts`:

```typescript
saveApiKey(): void {
  // Implementa aquí la lógica para guardar la API key
  localStorage.setItem('torn_api_key', this.apiKey);
}
```

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Créditos

- Diseño basado en los mockups de la carpeta `design/`
- Fuente: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- Iconos: [Material Symbols](https://fonts.google.com/icons)
