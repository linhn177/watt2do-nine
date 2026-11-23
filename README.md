# Watt2Do

[Live app](https://watt2do-nine.vercel.app)

Watt2Do helps Hillsborough County residents identify batteries and electronics, check what to do with them, and find nearby drop-offs. It includes a webcam and photo scanner, browser-local search history, a Google Maps view, and a short-answer assistant named Watty.

## Run locally

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env`, then run `npm start` and open [localhost:3001](http://localhost:3001). Manual disposal guidance works without credentials.

- `GEMINI_API_KEY` enables image scanning and helps Watty interpret questions.
- `GOOGLE_MAPS_BROWSER_KEY` enables the map. Enable Maps JavaScript API and allow `http://localhost:3001/*` and your production website in the browser key's website restrictions.

Vercel serves the Node handler in `api/watt2do.js`. Set the same environment variable names in Vercel Production and redeploy after changes. Recent searches stay in the current browser and record item type, condition, and time for both scans and manual lookups.

## Tools and AI disclosure

The app uses Node.js, browser JavaScript, HTML, CSS, Vercel, Google Maps JavaScript API. Gemini suggests item type and condition from submitted camera frames or uploads, and helps classify Watty questions. Watt2Do uses its own disposal rules and directory for guidance. Users review the suggested condition before requesting drop-offs.

During the hackathon, the participant defined the workflow and directed development. OpenAI Codex helped generate and refine the app code, research the directory, and verify behavior. The current app includes the team's map integration.

## Disposal references

- [Hillsborough County battery disposal](https://hcfl.gov/residents/property-owners-and-renters/trash-and-recycling/discarding-batteries)
- [Hillsborough County electronics disposal](https://hcfl.gov/residents/property-owners-and-renters/trash-and-recycling/discarding-paint-and-electronics)
- [The Battery Network locator](https://locator.batterynetwork.org/)
