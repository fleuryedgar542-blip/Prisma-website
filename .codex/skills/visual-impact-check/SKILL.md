# SKILL: visual-impact-check

## Doel
Zorgen dat wijzigingen niet alleen technisch correct zijn,
maar ook daadwerkelijk zichtbaar effect hebben in de UI.

## Wanneer gebruiken
- UI/UX aanpassingen
- CSS wijzigingen
- accessibility fixes
- als “ik zie geen verschil” probleem

## Werkwijze

### 1. Identificeer zichtbare elementen
- body tekst
- headings
- hero tekst
- sectietekst
- lijsten
- tool content
- buttons
- labels

### 2. Traceer echte CSS-bronnen
- welke selectors sturen de UI?
- globale vs component styles
- CSS volgorde

### 3. Detecteer overschrijvingen
Zoek naar:
- latere selectors
- hogere specificiteit
- !important
- list-style: none
- font-weight overrides
- color overrides

### 4. Valideer visuele impact
Niet:
- “code aangepast”

Wel:
- “zichtbaar verschil”

### 5. Check kritische secties
- homepage hero
- herkenningssecties
- tool flow
- resultaat scherm

### 6. Reading mode check
- werkt body class?
- pakt het alle tekst?
- verschil merkbaar?

### 7. Minimale fix strategie
- geen redesign
- geen nieuwe features
- alleen zichtbare impact

## Output formaat

A. Probleemoorzaak
B. Concrete fixes
C. Zichtbare veranderingen
D. Visuele checklist
E. Risico check

## Belangrijk
Geen zichtbaar verschil = niet geslaagd
