# Frontend: Priority Queue Simulation (React/TypeScript)

## Obsah

- [Požiadavky](#požiadavky)
- [Inštalácia a spustenie](#inštalácia-a-spustenie)
- [Technológie](#technológie)
- [Vlastnosti (Implemented Features)](#vlastnosti-implemented-features)
- [Environmentálne premenné](#environmentálne-premenné)

## Požiadavky

- Node.js (LTS verzia)
- Yarn (v1.x)

## Inštalácia a spustenie

1. **V adresári `frontend` nainštalujte závislosti:**

   ```bash
   yarn install
   ```

2. **Environmentálne premenné:**
   Vytvorte súbor `.env.local` v adresári `frontend/` a vyplňte ho podľa sekcie [Environmentálne premenné](#environmentálne-premenné).
3. **Spustenie:**

   ```bash
   # Development
   yarn dev

   # Build
   yarn build
   yarn start
   ```

## Technológie

- **React**
- **TypeScript**
- **Vite**
- **Socket.IO Client**
- **ESLint**
- **Prettier**

## Vlastnosti (Implemented Features)

- **Vizualizácia fronty:** Zobrazuje aktívne a dokončené úlohy, ich detaily (ID, názov, priorita, progres, dátum vytvorenia/dokončenia) s progress barmi.
- **Real-time Updates:** Okamžitá aktualizácia stavu fronty, progresu úloh a ich zoradenia vďaka Socket.IO.
- **Task Management:** Formulár na pridávanie nových úloh s validáciou, tlačidlo na vymazanie dokončených úloh.
- **Error/Loading States:** Zobrazuje loading stav pri pripojení a dočasné chybové správy pre lepšiu spätnú väzbu.

## Environmentálne premenné

Pre správnu funkčnosť frontendu je potrebné definovať nasledujúce environmentálne premenné v súbore `.env.local` v adresári `frontend/`:

```
VITE_API_BASE_URL=http://localhost:5050/api
VITE_SOCKET_SERVER_URL=http://localhost:5050
```
