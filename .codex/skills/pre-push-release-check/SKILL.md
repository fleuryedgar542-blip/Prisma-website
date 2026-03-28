# Pre Push Release Check

Gebruik deze skill vlak vóór je code pusht of live zet.

## Doel

Bepaal of de site veilig is om te deployen.

ALLEEN:
- blockers
- risico’s
- ja/nee beslissing

## Focus

1. Critical errors
- JS runtime errors
- kapotte HTML structuur
- null selectors die crashen

2. Homepage
- index.html en en/index.html laden zonder errors
- CTA werkt
- geen console errors

3. Toolflow
- prisma-dag
- prisma-week
- prisma-signaal (NL + EN)

Check:
- pagina laadt
- flow werkt
- eindscherm verschijnt

4. Feedback
- formulier bestaat
- JS gekoppeld

## Output

### A. Status
SAFE TO DEPLOY / NOT SAFE TO DEPLOY

### B. Blockers

### C. Risico’s

## Regels

- Fix niets
- Geen redesign
- Alleen beoordelen
