# fci-cafci — Dashboard de Fondos Comunes de Inversión

Dashboard web para consultar fondos comunes de inversión usando la API pública de CAFCI (Cámara Argentina de Fondos Comunes de Inversión).

## Funcionalidades

- **Buscador de fondos** por nombre contra la API de CAFCI  
- **Ingreso manual de IDs** (fondoId + claseId) como alternativa  
- **Cards** con VCP, rendimiento diario y patrimonio  
- **Panel de detalle** con gráfico histórico de VCP o rendimiento %  
- **Períodos**: 7D, 1M, 3M, 6M, 1A  
- **Persistencia local** (localStorage) — los fondos se guardan entre sesiones  
- Diseño oscuro responsivo

## Tecnologías

| Rol | Librería |
|---|---|
| UI | React 19 + TypeScript |
| Bundler | Vite |
| Gráficos | Recharts |
| API | `fetch` nativo con proxy Vite |

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor corre en `http://localhost:5173`. Vite hace proxy de `/api/*` hacia `https://api.cafci.org.ar`.

## Endpoints de la API CAFCI usados

| Endpoint | Descripción |
|---|---|
| `GET /fondo?nombre=...` | Lista fondos (con búsqueda) |
| `GET /fondo/{id}/clase` | Clases/series de un fondo |
| `GET /fondo/{id}/clase/{claseId}/ficha` | VCP, rendimiento diario, patrimonio |
| `GET /fondo/{id}/clase/{claseId}/rendimiento/{desde}/{hasta}` | Serie histórica |

## Producción

Para desplegar en producción necesitás un proxy que reenvíe las llamadas a `https://api.cafci.org.ar` (la API no tiene CORS habilitado para dominios externos).

Podés configurar la URL del proxy con la variable de entorno:

```
VITE_API_BASE=https://tu-proxy.com
```

## IDs de fondos

Podés encontrar los IDs en la URL del sitio oficial:  
`https://www.cafci.org.ar/ficha-fondo.html?q=847;2409`  
→ fondoId = **847**, claseId = **2409**
