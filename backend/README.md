# Backend: Priority Queue Simulation (Node.js/Express/TypeScript)

## Obsah

- [Požiadavky](#požiadavky)
- [Inštalácia a spustenie](#inštalácia-a-spustenie)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Environmentálne premenné](#environmentálne-premenné)

## Požiadavky

- Node.js (LTS verzia)
- Yarn (v1.x)

## Inštalácia a spustenie

1. **V adresári `backend` nainštalujte závislosti:**

   ```bash
   yarn install
   ```

2. **Environmentálne premenné:**
   Vytvorte súbor `.env` v adresári `backend/` a vyplňte ho podľa sekcie [Environmentálne premenné](#environmentálne-premenné) alebo použite predvolené hodnoty (pozri `src/config/environment.ts`).
3. **Spustenie:**

   ```bash
   # Development
   yarn dev

   # Build
   yarn build
   yarn start
   ```

## API Endpoints

Všetky endpointy sú prefixované `/api`.

- **`GET /api/tasks`**
  - **Popis:** Získanie všetkých aktívnych úloh v priorizovanom poradí.
  - **Odpoveď:** `ApiResponse<Task[]>`
- **`POST /api/tasks`**
  - **Popis:** Pridanie novej úlohy do fronty.
  - **Telo požiadavky (JSON):**
    ```json
    {
      "name": "Názov úlohy",
      "priority": 10
    }
    ```
  - **Odpoveď:** `ApiResponse<Task>`
- **`GET /api/tasks/completed`**
  - **Popis:** Získanie všetkých dokončených úloh.
  - **Odpoveď:** `ApiResponse<CompletedTask[]>`
- **`DELETE /api/tasks/completed`**
  - **Popis:** Vymazanie všetkých dokončených úloh z fronty.
  - **Odpoveď:** `ApiResponse<null>` (status 200 OK)

## WebSocket Events

- **`client -> server: 'join_queue'`**
  - **Popis:** Klient pošle túto udalosť po pripojení, aby signalizoval, že chce začať monitorovať frontu. Server mu v odpovedi pošle aktuálny stav fronty.
  - **Payload:** `QueueUpdatePayload` ({ activeTasks: Task[], completedTasks: CompletedTask[], currentlyProcessingTask: Task | null })
- **`server -> client: 'queue_update'`**
  - **Popis:** Server vyšle túto udalosť všetkým pripojeným klientom, keď sa zmení celkový stav fronty (pridanie úlohy, dokončenie úlohy, vymazanie úloh, zmena priorít).
  - **Payload:** `QueueUpdatePayload` ({ activeTasks: Task[], completedTasks: CompletedTask[], currentlyProcessingTask: Task | null })
- **`server -> client: 'task_progress'`**
  - **Popis:** Server vyšle túto udalosť všetkým pripojeným klientom, keď sa zmení progres konkrétnej úlohy.
  - **Payload:** `TaskProgressPayload` ({ taskId: string, progress: number })
- **`server -> client: 'task_completed'`**
  - **Popis:** Server vyšle túto udalosť všetkým pripojeným klientom, keď sa úloha dokončí (dosiahne 100% progresu).
  - **Payload:** `TaskCompletedPayload` ({ task: CompletedTask })

## Environmentálne premenné

Pre konfiguráciu backendu sú potrebné nasledujúce environmentálne premenné, ktoré by mali byť definované v súbore `.env` v adresári `backend/`.

```
PORT=5050				# Kde bude bežať backend
FRONTEND_URL=[http://localhost:5173] 	# Podla konfigurácie frontendu
LOG_LEVEL=INFO				# Level logovania

# Spracovanie úloh
TASK_PROCESS_INTERVAL_MS=5000		# Ako často sa updatuje vykonávaná úloha
TASK_PROGRESS_INCREMENT_MIN=10		# Minimálny progres vykonávanej úlohy
TASK_PROGRESS_INCREMENT_MAX=20		# Maximálny progres vykonávanej úlohy
AGING_FACTOR=10000			# Čím menší, tým rýchlejšie úlohy starnú

# Rate limiting
API_TASK_ADD_LIMIT_WINDOW_MS=60000	# 1 minúta
API_TASK_ADD_LIMIT_MAX_REQUESTS=10	# Počet možných požiadaviek v intervale
```
