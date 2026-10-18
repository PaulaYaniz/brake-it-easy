# Brake It Easy

An Expo/React Native iPhone prototype for reviewing driving patterns after a trip. The flow is Home → timed drive screen → recorded drive recap → History. **Finish drive** opens the next of four recorded cases, then wraps to the first. Recaps include a draggable velocity chart, reviewable acceleration and braking moments, a case-specific practice, and transparent baseline fuel and tailpipe CO₂ estimates.

## Run

```bash
npm install
npx expo run:ios
```

The four recorded cases work offline without a car or iPhone sensor permissions. `npm run web` provides a browser preview. The timer runs from **Start drive** until **Finish drive**. It controls when the recap opens; the recap's duration and graph describe the original recorded segment, not elapsed preview time.

## Check

```bash
npm run typecheck
npm run lint
npm run test:core
```

## How the prototype interprets data

- The demo uses two dashboard-phone recordings, split into four distinct, nonoverlapping excerpts. It does not claim these were four independently recorded journeys.
- The timed screen does not capture live sensors. A future live version would need mounted-phone motion and a separate location input for speed and distance.
- Review candidates are grouped changes in location or replay speed, not safety judgments. A phone cannot establish why a driver braked. Event details invite context and explicitly allow for necessary maneuvers.
- Estimates use trip miles ÷ entered gasoline mpg, then gallons × 8.887 kg CO₂ per US gallon. Fuel price is optional. This is baseline modeled fuel and tailpipe CO₂, not measured engine use, event-specific extra fuel, or savings. The starting 25 mpg is illustrative and can be edited in **How it’s estimated**.
- Trips, vehicle assumptions, and chosen practices are stored locally with SQLite. Recorded sessions retain a source label.

The replay comes from Nazirkar (2021), DOI [10.17632/5stn873wft.1](https://doi.org/10.17632/5stn873wft.1), CC BY 4.0. See [REPLAY_SOURCE.md](REPLAY_SOURCE.md) for the import and unit caveats. The gasoline tailpipe factor is from the [US EPA](https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle).

## Current limits

This is a recorded-data prototype. The timer is part of the presentation flow and does not measure the source trip. The simple speed-change rules are review prompts rather than a validated driving classifier. Replay units are inferred from the source files. Live motion, location accuracy, mounting behavior, and interruption handling require future device testing. The app should only be used for review after parking.
