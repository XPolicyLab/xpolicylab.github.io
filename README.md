# xpolicylab.github.io

Project website for **XPolicyLab** — a unified standard and open ecosystem for robot policy evaluation and deployment.

## Local preview

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Structure

```
├── index.html
├── contributors.html          # redirects to index
├── css/styles.css
├── css/leaderboard.css        # RoboTwin / RoboDojo Top 10 widgets
├── js/main.js
├── js/leaderboard/widget.js   # live-sync board mounts
├── data/boards.json           # registry of remote board URLs
└── assets/
    ├── logo.png
    ├── booth_transparent.png  # real-eval cell
    ├── partners/              # optional partner marks
    └── paper/
        ├── XPolicyLab.pdf
        ├── fig1.png           # policy zoo overview
        ├── fig2.png           # infrastructure
        └── fig3.png           # cross-platform eval
```

## Live leaderboards

The homepage mounts two Top 10 widgets that fetch official JSON on each visit:

- RoboTwin 2.0: `https://robotwin-platform.github.io/data/robotwin_leaderboard.json`
- RoboDojo Sim: `https://robotwin-platform.github.io/data/robodojo_leaderboard.json`

Drop another mount anywhere:

```html
<div data-xpl-lb="robotwin" data-top="10" data-refresh="300"></div>
<div data-xpl-lb="robodojo" data-top="10" data-refresh="300"></div>
```

`data-refresh` is seconds between refetches (omit to load once). Override `data-url` / `data-page` / `data-top` per mount if a later page needs a different source.

## Links

- Code: [XPolicyLab/XPolicyLab](https://github.com/XPolicyLab/XPolicyLab)
- Contribute: [CONTRIBUTING.md](https://github.com/XPolicyLab/XPolicyLab/blob/main/CONTRIBUTING.md)
