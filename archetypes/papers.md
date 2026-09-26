---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date | time.Format "2006-01-02" }}
# Add a trailing * to mark equal contribution. Names in params.highlightAuthors are rendered in bold.
authors: ["Anas Houssaini", "Co-Author One", "Co-Author Two"]
venue: "Conference 2026"
# venueNote: "under review"   # optional, shown after the venue
# weight: 1                   # optional, lower numbers float to the top; otherwise sorted by date
tags: ["keyword 1", "keyword 2"]
description: "One sentence for search engines (less than 155 characters)."
summary: "One or two sentences shown under the paper on the home and Papers pages."
links:
  - name: Paper
    url: https://arxiv.org/abs/XXXX.XXXXX
  - name: Code
    url: https://github.com/anashoussaini/repo
  - name: Project page
    url: https://example.github.io/
# Media lives next to this file (e.g. media/overview.webp). `video` (with `poster`) replaces the
# image in the list thumbnail; `gallery` replaces the hero image on the paper page.
media:
  image: "media/overview.webp"
  alt: "What the figure shows."
  # video: "media/demo.mp4"
  # poster: "media/demo.webp"
  # gallery:
  #   - video: "media/demo.mp4"
  #     poster: "media/demo.webp"
  #     caption: "Task name"
cover:
  image: "media/overview.webp"
  alt: "What the figure shows."
  relative: true
---

## Abstract

Abstract text.

## Citation

```bibtex
@inproceedings{key2026title,
  title     = {Title},
  author    = {Houssaini, Anas and Others},
  booktitle = {Venue},
  year      = {2026}
}
```
