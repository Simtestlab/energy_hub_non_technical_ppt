# Manapad Energy Hub: non-technical presentation

A 14-slide animated HTML deck for mixed audiences (fishermen, officials, funders). It combines the vision from `../energy-hub-proposal` (solar + battery hub at Manapad) with the plain-language findings of `../energy-hub-technical-presentation` (electric outboard retrofit), and sets out the three-boat pilot, the four-month timeline and the benefits for each stakeholder.

## Run it

Double-click `index.html`. It needs no build step, no server and no internet, because the fonts are bundled. Press **F** for full screen.

| Key | Action |
|---|---|
| → · Space · PageDown · clicker | Next slide |
| ← · Shift+Space · PageUp | Previous slide |
| Home / End | First / last slide |
| F or ⛶ | Full screen |
| Swipe | Next / previous on touch screens |

Deep link: `index.html#s6` opens slide 6.

## Slides

1 Title · 2 A fisherman's day · 3 The problem · 4 The idea (kerosene → electric) · 5 How it works (capture, store, charge, sail) · 6 Manapad site concept · 7 Three boats, three set-ups · 8 Feedback loop · 9 Four-month timeline · 10 Per-trip cost and CO₂ · 11 Who benefits · 12 Field visits · 13 Long-term vision · 14 Close

## Folder

```
index.html              all slide text
styles/deck.css         layout, colours, animation
styles/fonts.css        bundled fonts (SIL OFL), copied from energy-hub-proposal
scripts/deck.js         navigation, scaling, maps
scripts/site-geometry.js  traced Manapad zones, copied from energy-hub-proposal
assets/                 photos, logo, satellite image
```

## Editing

- **Text:** edit `index.html`. Each `<section class="slide">` is one slide, in order.
- **Colours:** tokens at the top of `styles/deck.css`.
- **Pilot set-ups (slide 7):** the three set-ups shown are examples. Replace them once the boat survey fixes the real configurations.

## Sources of numbers

Every figure comes from the technical deck and is marked on screen as an estimate: about 3 h of engine running per trip, ≈ ₹950 fuel vs ≈ ₹155 electricity per trip, ≈ 32 vs ≈ 14 kg CO₂ per trip, and about 1 in 8 parts of fuel energy reaching the propeller. The pilot is meant to replace all of them with measured data.

## Credits

- Coast photos (slides 1 and 14, illustrative, not Manapad): Sriram Jagannathan (CC BY-SA 4.0), melanie-m/Flickr (CC BY 2.0) and Edwin Singh (CC BY-SA 4.0), via Wikimedia Commons.
- Outboard photos: Yamaha Motor, Torqeedo, ePropulsion and a Mercury dealer.
- Satellite imagery: ©2026 Airbus, Maxar Technologies; map data ©2026 Google. Check the Google Maps attribution terms before public distribution.
- Field-visit photos: the project team.
