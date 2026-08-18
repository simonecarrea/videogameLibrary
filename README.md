# GameShelf POC

POC di una libreria personale di videogiochi con catalogo generale, prezzi indicativi e scheda dettaglio.

## Funzioni
- Libreria personale per PS5, Steam e Switch 2
- Stati `In corso`, `Giocati`, `Da giocare`
- Ricerca e filtri
- Catalogo mock
- Scheda dettaglio con descrizione, generi, sviluppatore, publisher, rating e prezzi
- Aggiunta/rimozione e cambio stato
- Persistenza via `localStorage`
- UI responsive dark

## Avvio
Non servono dipendenze. Apri `index.html` o servi la directory con un web server statico, ad esempio `python3 -m http.server 8080`.

## Architettura futura
Questa POC separa i dati (`data.js`) dalla UI. Il passo successivo è introdurre adapter/service verso RAWG o IGDB per il catalogo e un provider prezzi come IsThereAnyDeal o retailer/API disponibili. La libreria personale potrà migrare da `localStorage` a Supabase/PostgreSQL con autenticazione.

> I prezzi presenti nella POC sono mock indicativi e non prezzi live.