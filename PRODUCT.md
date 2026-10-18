# Brake It Easy

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Users

Everyday and newer drivers who want understandable feedback after parking, using a securely mounted phone.

## Product Purpose

Open an attributed recorded drive excerpt, review movement and speed changes afterward, and choose one practical habit to try next time.

## Operating Context

The home screen starts a timer. Finish drive opens the next of four bundled recorded excerpts. The recap shows draggable velocity over time, modeled environmental impact, reviewable driving moments, and one case-specific practice. History stores local sessions and the chosen practice. The timer does not measure the original trip duration.

## Capabilities and Constraints

- The current timed flow does not capture phone sensors. A future live version needs motion plus a separate location input for speed and distance.
- Four Nazirkar 2021 replay cases use real dashboard-phone readings condensed to one-second samples. They are two excerpts from each of two original trips, not four independent recordings. Source speed and distance units are inferred.
- Phone motion does not directly measure emissions or prove safety. Fuel and tailpipe CO₂ are baseline estimates based on distance and editable gasoline vehicle economy. The app does not claim savings, crash-risk reduction, or fault for a braking event.
- Source labels distinguish live sessions from recorded replay. Trips and practice selections are stored locally.
- The user should interact with the app only while parked.

## Brand Commitments

The name is Brake It Easy. The voice is friendly, concise, and nonjudgmental. The latest user-provided Clue app image is the binding visual reference for color, typography, and simplicity; product content remains about driving.

## Evidence on Hand

`src/data/nazirkar_cases.json` contains the four attributed recorded excerpts. `REPLAY_SOURCE.md` records attribution and transformations. No measured fuel use, emissions, safety outcome, or physical-iPhone validation is available.

## Product Principles

- One clear action per state.
- Observation before technical explanation.
- Explain estimates and unknown context without overstating certainty.
- Keep the timed drive state quiet and review after parking.

## Accessibility & Inclusion

Readable text, safe-area placement, meaningful labels beyond color, and accessible touch targets are required by the supplied brief.
