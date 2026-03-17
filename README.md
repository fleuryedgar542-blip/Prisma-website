# PRISMA Systemen

PRISMA Systemen is een rustige, tweetalige website voor neurodivergente jongvolwassenen.
De site bevat informatieve pagina's, blogartikelen en drie interactieve tools:

- PRISMA Dag / PRISMA Day
- PRISMA Week
- PRISMA Signaal / PRISMA Signal

De website is bewust simpel gehouden en draait zonder framework of buildstraat.

## Hoe de site werkt

Deze repo is een statische website op basis van:

- HTML
- CSS
- Vanilla JavaScript

Er is geen `npm`, geen bundler en geen build tool.
Pagina's worden direct als statische bestanden geserveerd.

Belangrijke gedeelde bestanden:

- `stijl.css` voor gedeelde styling
- `nav.js` voor gedeelde navigatie- en taalgerelateerde logica
- `service-worker.js` voor offline/PWA-gedrag

## Lokaal draaien

Open de site niet direct via `file://`, maar start een simpele lokale server.
Dat is nodig voor correcte werking van root-relative paden en de service worker.

Voorbeeld met Python:

```bash
cd /Users/fleurcibap/Documents/Playground/Prisma-website-github
python3 -m http.server 8000
```

Open daarna:

- `http://localhost:8000/` voor Nederlands
- `http://localhost:8000/en/` voor Engels

## Deploy

De site is ingericht als statische GitHub Pages-site:

- bestanden staan direct in de repo-root
- er is geen buildstap nodig
- `CNAME` bevat het custom domein `prismasystemen.nl`

Gebruikelijke deploy-flow:

1. wijzig bestanden in deze repo
2. commit en push naar de branch die GitHub Pages publiceert
3. GitHub Pages serveert daarna de statische bestanden rechtstreeks

Als GitHub Pages op de standaard manier is ingesteld, is dat meestal de `main` branch met publicatie vanaf de repo-root.

## Mappenstructuur

```text
Prisma-website-github/
├── index.html              # Nederlandse homepage
├── over.html               # Nederlandse over-pagina
├── tools.html              # Nederlandse tools-pagina
├── contact.html            # Nederlandse contact-pagina
├── blog.html               # Nederlandse blog-overzichtspagina
├── blog/                   # Nederlandse blogartikelen
├── en/                     # Engelse varianten van pagina's en blogs
├── prisma-dag.html         # Interactieve tool: PRISMA Dag
├── prisma-week.html        # Interactieve tool: PRISMA Week
├── prisma-signaal.html     # Interactieve tool: PRISMA Signaal
├── prisma-week-kopen.html  # Verkooppagina voor PRISMA Week
├── stijl.css               # Gedeelde stijlen
├── nav.js                  # Gedeelde navigatie- en taal-logica
├── service-worker.js       # Offline cache / PWA-logica
├── manifest*.json          # Web app manifests
├── sitemap.xml             # Sitemap
├── robots.txt              # Robots-configuratie
└── CNAME                   # Custom domein voor GitHub Pages
```

## Onderhoudspunten

- Nederlands leeft in de repo-root
- Engels leeft onder `en/`
- NL en EN moeten inhoudelijk en structureel consistent blijven
- SEO per pagina blijft belangrijk: `title`, `meta description`, `canonical`, `hreflang`, en precies één `h1`
- Grote interactieve pagina's bevatten momenteel veel inline logica en vragen daarom extra voorzichtigheid bij refactors
