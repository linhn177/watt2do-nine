# Watt2Do

Watt2Do helps Hillsborough County residents identify batteries and electronics, handle them safely, and find drop-offs in Hillsborough County and nearby communities.

[Open Watt2Do](https://watt2do-nine.vercel.app)

## What you can do

- **Scan an item.** Use your camera or upload a photo. Gemini suggests an item type and condition. Review both before requesting guidance. You can also choose them manually.
- **Find drop-offs.** Choose an item and condition, then see matching facilities on a Google Map. Distances are approximate and measured from central Tampa. Check each facility's acceptance rules before visiting.
- **Explore battery and e-waste risks.** Six tabs explain risks from lead-acid, lithium, nickel-cadmium, button and coin cells, alkaline batteries, and e-waste. Each tab links to its source.
- **Ask Watty.** Get short answers about safety, disposal, local drop-offs, environmental impacts, and using the app. Watty can use the current scan when you ask about that item. Its location suggestions come from the app's directory.
- **Review recent searches.** Scans and manual lookups stay in the current tab. See the latest three entries or choose **See more**. Photos are excluded from this history.

## Run locally

Install Node.js 22 or later. In the project folder, run:

```sh
npm ci
npm start
```

Open [http://localhost:3001](http://localhost:3001). To enable scanning and the map, copy `.env.example` to `.env`, fill in the keys, and restart the app.

| Variable | What it does |
| --- | --- |
| `GEMINI_API_KEY` | Enables image recognition and helps Watty classify unfamiliar questions. |
| `GEMINI_MODEL` | Overrides the default Gemini model. |
| `GOOGLE_MAPS_BROWSER_KEY` | Enables the map. Enable Maps JavaScript API in Google Cloud and allow `http://localhost:3001/*` and the production website in the key's website restrictions. |

Manual disposal guidance and Watty's built-in answers work without API keys. Camera access requires localhost or HTTPS and browser permission.

## Deploy

The GitHub repository includes `vercel.json` and the Node handler at `api/watt2do.js`. Set the API keys in the Vercel project's **Production** environment and redeploy after changing them. Keep `.env` out of Git.

## Scanner privacy

Live scanning sends up to three still images to Google Gemini for recognition. Photo uploads also go to Gemini. Keep private information out of the frame. Watt2Do does not write submitted images to disk.

## Tools and AI disclosure

Watt2Do uses Node.js, browser JavaScript, HTML, CSS, Vercel, the Google Maps JavaScript API, and the Google Gemini API. The app uses written disposal rules and its location directory to determine guidance and drop-offs. Gemini assists with item and condition recognition and classifies some Watty questions.

During the hackathon, the participant defined the workflow and directed development. OpenAI Codex helped generate and refine code, research the directory and educational sources, and verify the app. The current app includes the team's map integration.

## References

- [Hillsborough County battery disposal](https://hcfl.gov/residents/property-owners-and-renters/trash-and-recycling/discarding-batteries)
- [Hillsborough County electronics disposal](https://hcfl.gov/residents/property-owners-and-renters/trash-and-recycling/discarding-paint-and-electronics)
- [EPA household battery guidance](https://www.epa.gov/recycle/used-household-batteries)
- [The Battery Network locator](https://locator.batterynetwork.org/)
