# PRISMA Systemen — Codex Agent Richtlijnen

Je werkt aan PRISMA Systemen, gebouwd door Fleur.

PRISMA maakt rustige, simpele tools voor neurodivergente jongvolwassenen.
Focus ligt op duidelijkheid, rust en lage mentale belasting.

---

## 🔹 Algemene werkwijze

- Werk altijd met de bestaande codebase
- Maak geen onnodige wijzigingen
- Houd oplossingen simpel en overzichtelijk
- Denk in gebruikservaring, niet alleen techniek
- Voorkom over-engineering

---

## 🔹 Technische regels (altijd volgen)

- Alles wordt gebouwd in één HTML-bestand per pagina
  - HTML + CSS + JS in hetzelfde bestand
- Gebruik geen frameworks
- Gebruik geen npm, bundlers of build tools
- Gebruik alleen vanilla HTML, CSS en JavaScript
- Enige externe dependency: Google Fonts
- Geen externe libraries

---

## 🔹 Codekwaliteit

- Laat bestaande functionaliteit intact
- Verander geen werkende logica zonder reden
- Gebruik duidelijke en eenvoudige code
- Geen overbodige complexiteit
- Geen console.logs in de eindversie
- Houd scripts overzichtelijk en logisch gestructureerd

---

## 🔹 Design & UI (verplicht)

Gebruik altijd deze huisstijl:

:root {
  --beige: #F3EFE8;
  --grijs: #2E2E2E;
  --groen: #A8B5A2;
  --blauw: #6E7C8C;
  --grijs-licht: #E8E4DC;
  --grijs-mid: #9A9A9A;
}

### Fonts
- Titels: Noto Serif
- Body: Montserrat

Import:
https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap

### Designregels

- Rustig en minimalistisch
- Geen drukke UI
- Lichte achtergronden
- Subtiele borders
- Bijna geen shadows
- Zachte animaties

### Border radius

- Kaarten / inputs: 10px
- Tags / pills: 20px

### Animaties

Gebruik alleen subtiele animaties zoals:

- fade in
- translateY (max ~14px)

---

## 🔹 UX principes

- Lage mentale belasting
- Zo min mogelijk keuzes tegelijk
- Duidelijke stappen
- Geen overweldigende interfaces
- Mobile-first bouwen
- Altijd responsive

---

## 🔹 SEO regels (verplicht)

Elke pagina moet bevatten:

- 1 duidelijke <h1>
- <title> (uniek en beschrijvend)
- <meta name="description">
- <link rel="canonical">
- hreflang (NL en EN indien van toepassing)

Voor contentpagina’s:

- Logische heading-structuur (H1 → H2 → H3)
- Geen duplicate content
- Interne links naar relevante pagina’s

---

## 🔹 Taalstructuur (NL / EN)

- NL en EN pagina’s moeten dezelfde structuur hebben
- / = Nederlands
- /en/ = Engels

Gebruik correcte productnamen:

- PRISMA Dag → PRISMA Day
- PRISMA Week → PRISMA Week
- PRISMA Signaal → PRISMA Signal

- Geen gemixte talen in zichtbare UI
- Vertalingen moeten consistent zijn

---

## 🔹 Copy & tekst

- Schrijf rustig, duidelijk en menselijk
- Vermijd marketingtaal
- Vermijd overuitleg
- Houd zinnen kort en begrijpelijk
- Schrijf voor neurodivergente gebruikers

Gebruik de prisma-stem-human-review skill wanneer tekst herschreven moet worden.

---

## 🔹 Blog & content

- Blogs moeten SEO-gericht zijn
- Gebruik duidelijke structuur
- Voeg interne links toe naar tools
- NL en EN varianten moeten beide bestaan
- Houd tone of voice consistent

Gebruik blog-workflow voor nieuwe blogs.

---

## 🔹 Checks & validatie

Gebruik indien nodig:

- seo-check
- nl-en-consistency

Controleer altijd:

- Werken alle links?
- Kloppen productnamen?
- Is structuur consistent?
- Is de pagina rustig en duidelijk?

---

## 🔹 Wat je NIET doet

- Geen frameworks toevoegen
- Geen externe libraries
- Geen redesign zonder vraag
- Geen complexe architectuur
- Geen onnodige features bouwen
- Geen stijl veranderen zonder instructie

---

## 🔹 Belangrijkste principe

Houd alles:

- simpel
- rustig
- duidelijk
- bruikbaar

Als iets complexer voelt dan nodig → vereenvoudigen.