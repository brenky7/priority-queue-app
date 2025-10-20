# Priority Queue Simulation

TypeScript/Node.js a React aplikácia, ktorá simuluje prioritnú frontu úloh.
Systém obsahuje backend (REST API + WebSocket) pre správu úloh a frontend (React) pre vizualizáciu a interakciu v reálnom čase.

## Obsah

- [Vlastnosti](#vlastnosti)
- [Architektúra projektu](#architektúra-projektu)
- [Technológie](#technológie)
- [Požiadavky](#požiadavky)
- [Spustenie aplikácie](#spustenie-aplikácie)
- [Docker](#docker)
- [Bonusy](#bonusy)
- [Autori](#autori)

## Vlastnosti

- **Pridávanie úloh:** Pridanie novej úlohy do fronty s definovaným názvom a prioritou.
- **Simulácia spracovania:** Automatické spracovanie úloh na základe priority s inkrementálnym progresom (10-20% každých 5 sekúnd).
- **Starvation Prevention:** Implementovaná logika starnutia, ktorá zvyšuje prioritu starších, dlho čakajúcich úloh.
- **Real-time aktualizácie:** Okamžitá vizualizácia zmien vo fronte, progresu úloh a ich dokončenia pomocou WebSocketov (Socket.IO).
- **Manažment úloh:** Zobrazenie aktívnych a dokončených úloh, možnosť vymazania dokončených.
- **Spracovanie chýb:** Štandardizovaný formát API odpovedí a centralizovaný error handling.
- **Input Validácia:** Validácia vstupných dát pre pridávanie úloh na backende.
- **API Rate Limiting:** Ochrana API endpointu pre pridávanie úloh pred preťažením.
- **Graceful Shutdown:** Bezpečné vypnutie backend servera.

## Architektúra projektu

Projekt je rozdelený na dve hlavné časti:

1. **`backend/`**: Node.js/Express server s TypeScriptom, ktorý spravuje prioritnú frontu úloh.
2. **`frontend/`**: React/TypeScript aplikácia, ktorá vizualizuje stav fronty.

## Technológie

- **Backend:** Node.js, Express, TypeScript, Zod (validácia), Socket.IO , `express-rate-limit` , `dotenv` , `uuid` , ESLint, Prettier.
- **Frontend:** React, TypeScript, Vite, Socket.IO Client, ESLint, Prettier.

## Požiadavky

Pre spustenie aplikácie potrebujete mať nainštalované:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## Spustenie aplikácie

Pre spustenie backendu aj frontendu postupujte nasledovne:

1. **Klon repozitára:**

   ```bash
   git clone https://github.com/brenky7/priority-queue-app
   cd priority-queue-app
   ```

2. **Spustenie Backendu:**
   Podrobné inštrukcie v `backend/README.md`.
3. **Spustenie Frontendu:**
   Podrobné inštrukcie v `frontend/README.md`.

## Docker

Aplikácia je dostupná aj ako Docker image v GitHub Container Registry. Pre spustenie pomocou Dockeru:

```
# Stiahnutie Docker image
docker pull ghcr.io/brenky7/priority-queue-app:latest

# Spustenie kontajnera
docker run -p 5050:5050 ghcr.io/brenky7/priority-queue-app:latest
```

## Bonusy

Tento projekt zahŕňa nasledujúce bonusové body zo zadania:

- Použitie Socket.IO pre real-time aktualizácie fronty
- Implementácia graceful shutdown a robustného error handlingu
- Input validácia a sanitizácia (použitím Zod)
- Použitie environmentálnych premenných pre konfiguráciu
- TypeScript strict mode v celom projekte
- Implementácia proper loggingu s nastaviteľnými úrovňami
- Implementácia API rate limitingu
- Použitie moderných React patternov (hooks, funkcionálne komponenty)
- Dobrý dizajn komponentov a organizácia kódu (vlastné hooky, API klient trieda)
- Štandardizovaný formát API odpovedí
- Dockerfile a docker image pre jednoduchý deployment

## Autor

- Peter Brenkus
