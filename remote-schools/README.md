# Share pages (join, profile, file)

Static pages for your portfolio repository `trebronwayne.github.io`. They need no build and cost nothing.

| Link | What it does |
|---|---|
| `remote-schools/join/?ref=CODE` | Invitation: the friend creates an account (email or Google) with the code already filled in, then downloads the app and signs in. |
| `remote-schools/u/?id=UID` | A community profile: avatar, name, role, school, bio and the links a moderator would allow. A button opens it in the app. |
| `remote-schools/f/?id=ITEM` | A shared file: details, owner, views, rating, and a preview of the first 3 pages of a PDF. Each device is counted once. |

Android opens these links straight in the app when it is installed (see step 3).

## 1. Copy the files into your repo

```
trebronwayne.github.io/
├─ .nojekyll                       <- empty file (needed so GitHub serves the .well-known folder)
├─ .well-known/assetlinks.json     <- step 3
└─ remote-schools/
   ├─ index.html                   <- replace with site/index.html (it forwards old ?ref= links to join/)
   ├─ rs-config.js  rs-web.js  rs-web.css
   ├─ join/index.html   u/index.html   f/index.html
   ├─ version.json  facts/ ...     (already there)
```

```bash
cd trebronwayne.github.io
cp -r path/to/project/site/. remote-schools/            # all pages and rs-*.js/css, plus index.html
mkdir -p .well-known && mv remote-schools/.well-known/assetlinks.json .well-known/
rm -rf remote-schools/.well-known
touch .nojekyll && rm -f remote-schools/.nojekyll
git add -A && git commit -m "Share pages: join, profile, file" && git push
```

## 2. Fill in `remote-schools/rs-config.js`

Set `COMMUNITY_API` to the same address as `COMMUNITY_API` in the app (`src/community/config.ts`). It is only used to preview PDFs.

## 3. Let Android open the links in the app

Get the SHA-256 fingerprint of the key your release APK is signed with:

```bash
keytool -list -v -keystore your-release.jks -alias your-alias | grep "SHA256"
# or from a built APK:  apksigner verify --print-certs RemoteSchools.apk
```

Paste it (with colons, like `AB:CD:...`) into `.well-known/assetlinks.json` in the repo root. Check `https://trebronwayne.github.io/.well-known/assetlinks.json` opens in a browser. Rebuild the app (the CI adds the link rules to the manifest). Android checks the file when the app is installed, so reinstall once to test.

Until it is verified, links simply open the web page, which has an "Open in the app" button.

## 4. Firebase console (once, free)

1. **Authentication > Settings > Authorized domains:** add `trebronwayne.github.io` (needed for the sign-up page and Google sign-in).
2. **Authentication > Sign-in method:** turn on **Anonymous**. Visitors on the file page get an anonymous id only so a view is counted once per device. Nothing else is allowed for them.
3. Publish the new `firestore.rules`.

## Notes

- Profile and file pages only show what the app shows: suspended profiles and files are "not available"; links must be social or approved by a moderator.
- Views from the web count once per browser (clearing browser data makes a new device). Views from signed-in accounts count once per account, as before.
- Chat apps show a generic card (title and the Remote Schools icon) when the link is pasted, because GitHub pages are static. The page itself shows the full details.
