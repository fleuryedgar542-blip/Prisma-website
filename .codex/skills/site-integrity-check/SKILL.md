# Site Integrity Check

Gebruik deze skill om de PRISMA-website te controleren op technische integriteit, regressies en kapotte pagina-opbouw.

## Doel

Voorkom dat wijzigingen aan 1 pagina onbedoeld andere pagina’s, tools of de algemene HTML-structuur breken.

Deze skill is bedoeld voor:
- checks na grotere edits
- checks vóór push/deploy
- regressiecontrole als iets “ineens raar doet”
- het opsporen van stille fouten zoals kapotte `<style>` / `<script>` scheiding

## Belangrijke projectcontext

PRISMA is een statische site met:
- HTML
- CSS
- JavaScript
- geen framework
- NL en EN versies
- tools met client-side logica

Belangrijkste toolpagina’s:
- prisma-dag.html
- prisma-week.html
- prisma-signaal.html
- en/prisma-day.html
- en/prisma-week.html
- en/prisma-signal.html

Belangrijke algemene pagina’s:
- index.html
- en/index.html
- voorwaarden.html
- privacy-gerelateerde pagina’s
- contactpagina’s
- blogpagina’s
- landingspagina’s
- pagina’s die vanuit navigatie, footer of toolflows gelinkt worden

## Hoofdfocus

Controleer vooral op:

1. HTML-integriteit
2. interne links
3. tool-integriteit
4. SEO-basics
5. regressierisico na edits

Niet op:
- copy-optimalisatie
- designverbeteringen
- nieuwe features
- herschrijven van pagina’s zonder expliciete vraag

## 1. HTML-integriteit

Controleer per relevante HTML-pagina:

- precies 1 `<html>`
- precies 1 `<head>`
- precies 1 `<body>`
- geldige globale opbouw
- geen parser-brekende structuur
- geen JavaScript binnen `<style>`
- geen CSS binnen `<script>`
- correcte afsluiting van `<style>` en `<script>`
- geen dubbele `</head>` of `</body>`
- geen duidelijk kapotte nesting waardoor de browser raar moet herstellen
- geen script/style-lekken naar andere delen van het document

### Critical voorbeelden
Markeer als **critical**:
- JavaScript in `<style>`
- CSS in `<script>`
- ontbrekende/slordige afsluiting waardoor documentopbouw breekt
- pagina kan niet normaal geparsed worden
- essentiële toolpagina laadt technisch kapot

## 2. Interne links

Controleer:
- verwijzen interne links naar bestaande bestanden?
- werken navigatielinks?
- werken footerlinks?
- werken NL ↔ EN wissels?
- werken links naar voorwaarden/privacy/contact?
- werken links van homepage naar tools?
- werken links tussen tool-gerelateerde pagina’s?

### High voorbeelden
Markeer als **high**:
- belangrijke navigatielink kapot
- toollink kapot
- voorwaarden/privacy/contact link kapot
- NL/EN wissel verwijst naar niet-bestaande pagina

## 3. Tool-integriteit

Controleer voor alle 6 toolpagina’s:

- pagina laadt zonder duidelijke globale JS-fout
- belangrijkste interactieve elementen bestaan nog
- flow kan gestart worden
- stappen kunnen logisch doorlopen worden
- resultaat/eindscherm kan bereikt worden
- feedbackformulier bestaat
- selectors waar JS van afhankelijk is nog bestaan
- recente copy/flow-wijzigingen geen oude selectors hebben gebroken

Specifieke aandacht:
- feedback-form.js koppelingen
- gedeelde JS/CSS die meerdere tools raakt
- selectors of data-attributen die door meerdere pagina’s gebruikt worden

### High voorbeelden
Markeer als **high**:
- toolflow werkt niet meer
- knop of stap kan niet verder
- eindscherm verschijnt niet
- feedbackformulier ontbreekt of koppelt niet meer logisch

## 4. SEO-basics

Controleer waar verwacht:
- `<title>` aanwezig
- meta description aanwezig
- canonical aanwezig
- hreflang aanwezig waar relevant
- structured data niet duidelijk syntactisch kapot
- NL/EN paren logisch

### Medium voorbeelden
Markeer als **medium**:
- missende canonical
- hreflang mismatch
- meta description ontbreekt
- structured data syntax issue zonder directe paginabreuk

## 5. Regressierisico

Let extra op:
- bestanden die meerdere pagina’s beïnvloeden
- gedeelde script- of styleblokken
- wijzigingen die één pagina fixen maar elders schade doen
- verouderde selectors of verwijzingen na edits
- inconsistenties tussen NL/EN varianten

## Severity-regels

Gebruik alleen deze labels:

- **critical** = pagina/tool technisch kapot of parsering breekt
- **high** = belangrijke flow, link of toolfunctie werkt niet
- **medium** = duidelijke fout of inconsistentie zonder directe blokkade
- **low** = klein risico, opruimpunt of lichte kwaliteitsissue

## Output format

Geef altijd:

### A. Samenvatting
- aantal gecontroleerde bestanden
- aantal critical / high / medium / low issues
- korte conclusie: veilig of niet veilig om te pushen/deployen

### B. Issues per bestand
Per issue:
- bestand
- severity
- probleem
- waarom dit belangrijk is
- aanbevolen fix

### C. Prioriteit
Verdeel duidelijk in:
1. direct fixen vóór push/deploy
2. snel fixen maar niet blocker
3. later opschonen

## Werkwijze

Werk in deze volgorde:

1. Controleer eerst HTML-integriteit van relevante pagina’s
2. Controleer daarna interne links
3. Controleer vervolgens de 6 toolpagina’s
4. Controleer daarna SEO-basics
5. Beoordeel regressierisico
6. Rapporteer bevindingen compact en duidelijk

## Belangrijke gedragsregels

- Fix niets automatisch tenzij expliciet gevraagd
- Focus eerst op vinden en prioriteren
- Doe geen redesignvoorstellen
- Doe geen featurevoorstellen
- Houd aanbevelingen praktisch en klein
- Wees extra alert op stille structurele fouten zoals in voorwaarden.html

## Wanneer gebruiken

Gebruik deze skill:
- na grotere edits
- na aanpassingen aan gedeelde bestanden
- vóór belangrijke push/deploy
- als pagina’s “bestaan maar raar doen”
