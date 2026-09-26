---
title: "Tactile Modality Fusion for Vision-Language-Action Models"
date: 2026-03-15
authors: ["Charlotte Morissette", "Amin Abyaneh", "Wei-Di Chang", "Anas Houssaini", "David Meger", "Hsiu-Chin Lin", "Jonathan Tremblay", "Gregory Dudek"]
venue: "ECCV 2026"
tags: ["vision-language-action models", "tactile sensing", "multimodal fusion", "robot learning"]
description: "TacFiLM fuses tactile sensing into vision-language-action models by conditioning visual features on pretrained tactile representations with FiLM."
summary: "TacFiLM is a lightweight post-training fusion method that conditions a VLA's intermediate visual features on pretrained tactile representations through feature-wise linear modulation, improving success rate, completion time, and force stability on contact-rich insertion and drawer-opening tasks."
links:
  - name: Paper
    url: https://arxiv.org/abs/2603.14604
  - name: Project page
    url: https://charliem7.github.io/projects/TacFilm/
media:
  image: "media/overview.webp"
  alt: "TacFiLM overview: tactile, visual, and language inputs, baseline fusion approaches, and the TacFiLM-augmented VLA."
cover:
  image: "media/overview.webp"
  alt: "TacFiLM overview: tactile, visual, and language inputs, baseline fusion approaches, and the TacFiLM-augmented VLA."
  relative: true
---

## Abstract

We propose TacFiLM, a lightweight modality-fusion approach that integrates visual-tactile signals into vision-language-action (VLA) models. While advances in VLAs have introduced robot policies that are both generalizable and semantically grounded, these models mainly rely on vision-based perception. Vision alone, however, cannot capture the complex interaction dynamics that occur during contact-rich manipulation, including contact forces, surface friction, compliance, and shear. While recent attempts to integrate tactile signals into VLA models often increase complexity through token concatenation or large-scale pretraining, the heavy computational demands of behaviour models necessitate lightweight fusion strategies. To address these challenges, TacFiLM outlines a post-training finetuning approach that conditions intermediate visual features on pretrained tactile representations using feature-wise linear modulation (FiLM). Experimental results on insertion and drawer opening tasks demonstrate consistent improvements in success rate, direct task performance, completion time, and force stability across both in-distribution and out-of-distribution tasks. Together, these results support our method as an effective approach to integrating tactile signals into VLA models, improving contact-rich manipulation behaviours.

## Citation

```bibtex
@inproceedings{morissette2026tactile,
  title     = {Tactile Modality Fusion for Vision-Language-Action Models},
  author    = {Morissette, Charlotte and Abyaneh, Amin and Chang, Wei-Di and Houssaini, Anas and Meger, David and Lin, Hsiu-Chin and Tremblay, Jonathan and Dudek, Gregory},
  booktitle = {European Conference on Computer Vision (ECCV)},
  year      = {2026},
  url       = {https://arxiv.org/abs/2603.14604}
}
```
