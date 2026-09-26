# anashoussaini.github.io

Personal website of Anas Houssaini, built with [Hugo](https://gohugo.io/) (extended) and a
customized [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme (vendored under
`themes/PaperMod`, with layouts derived from [hugo-website](https://github.com/pmichaillat/hugo-website)).
Deployed to GitHub Pages by `.github/workflows/hugo.yml` on every push to `main`.

## Run locally

```bash
hugo server --port 1313          # requires hugo_extended >= 0.147.2
```

## Add a paper

```bash
hugo new papers/<slug>/index.md  # scaffolds from archetypes/papers.md
```

Put the figure/video under `content/papers/<slug>/media/` and fill in the front matter:
`authors` (append `*` for equal contribution), `venue`, `venueNote`, `summary`, `links`, and `media`
(`image` for a thumbnail, or `video` + `poster` for a looping clip; `gallery` shows several clips on
the paper page). The home page and `/papers/` are both rendered from these files, grouped by year and
newest first; set `weight: 1` to pin a paper to the top of its year. The body holds the abstract and
BibTeX.

## Where things live

- `content/_index.md`: home page bio (front matter has `role` and `portrait`).
- `layouts/index.html`, `layouts/partials/paper_list.html`, `layouts/partials/paper_row.html`, `layouts/papers/`: home and paper templates.
- `assets/css/extended/research.css`: styles for the home intro and paper rows.
- `static/files/`: CV (résumé PDF), linked from the CV icon.
