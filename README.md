# Off The Block

A fueling and nutrition guide for female swimmers, built by Myra Bhalla.
It ships as a website and as an app for iPhone (Android coming).

- **Website:** https://myrabhalla.github.io/off-the-block/
- **App ID:** `com.myrabhalla.offtheblock`

## Folder map

| Folder / file | What it is |
|---|---|
| `src/` | **The original website.** All edits happen here. |
| `src/assets/` | Styles, scripts and illustrations shared by every page |
| `ios/` | The iPhone app project (opened in Xcode) |
| `www/` | Copy of `src/` made for the app — generated, not on GitHub |
| `capacitor.config.json` | App name, app ID and where the web files live |
| `package.json` | Tool versions and build commands |
| `.github/workflows/` | Publishes `src/` to the live website on every push |
| `CHANGELOG.md` | What changed in each version |

## Commands

```sh
npm install      # first time only: download the tools
npm run build    # copy src/ into www/
npm run sync     # build, then update the iPhone app with the new files
npm run ios      # sync, then open the app in Xcode
```

## How a change reaches people

1. Edit files in `src/`.
2. Commit and push to `main`. The live website updates by itself within a minute or two.
3. For the app: run `npm run sync`, raise the version number, test in Xcode, and submit to the App Store.
4. Record the change in `CHANGELOG.md`.
