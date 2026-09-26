---
title: "Morphology-Conditioned World Model for Cross-Embodiment Quadrupedal Locomotion"
date: 2026-04-09
authors: ["Mohamad H. Danesh", "Chenhao Li", "Amin Abyaneh", "Anas Houssaini", "Kirsty Ellis", "Glen Berseth", "Marco Hutter", "Hsiu-Chin Lin"]
venue: "CoRL 2026"
tags: ["world models", "legged locomotion", "cross-embodiment", "reinforcement learning"]
description: "QWM: a morphology-conditioned world model that trains quadruped locomotion policies in imagination and transfers them zero-shot to unseen robots."
summary: "QWM conditions a single generative dynamics model on scale-invariant morphology features and trains locomotion policies entirely in imagination. Given the same morphology information, a model-free policy degrades on unseen robots while QWM transfers zero-shot; to our knowledge, it is the first world model to show zero-shot cross-embodiment transfer within the quadrupedal family."
links:
  - name: Paper
    url: https://arxiv.org/abs/2604.08780
media:
  image: "media/overview.webp"
  alt: "Locomotion policies trained inside the Quadrupedal World Model deployed on real quadrupedal robots."
cover:
  image: "media/overview.webp"
  alt: "Locomotion policies trained inside the Quadrupedal World Model deployed on real quadrupedal robots."
  relative: true
---

## Abstract

World models promise a paradigm shift in robotics, where an agent learns the physics of its environment once and then acquires behaviors efficiently. Yet the learned dynamics models at their core are typically morphology locked. In legged locomotion, a dynamics model trained on an ANYmal-D quadruped fails on a Unitree Go1 because it overfits to one robot's embodiment rather than capturing the locomotion dynamics shared across robots, so even a small change in actuator dynamics or limb length forces retraining from scratch. However, if we formalize a robot's unique physical traits into a morphology specification, a controller for a family of robots can utilize this blueprint in two ways. It can feed the specification to a model-free policy, or it can feed the specification to a learned dynamics model and extract the policy in imagination. We argue for the second route and introduce the Quadrupedal World Model (QWM), which conditions a single generative dynamics model on scale-invariant physical features and trains policies entirely inside it, through a physical morphology encoder, an adaptive reward normalizer, and morphology conditioning in the latent dynamics. Holding the morphology information identical, a model-free policy matches QWM on the training cohort but degrades on unseen morphologies, while QWM transfers zero-shot with no fine-tuning, adaptation, or warm-up in such cases. To our knowledge, this is the first world model to demonstrate zero-shot cross-embodiment transfer within the quadrupedal family.

## Citation

```bibtex
@inproceedings{danesh2026morphology,
  title     = {Morphology-Conditioned World Model for Cross-Embodiment Quadrupedal Locomotion},
  author    = {Danesh, Mohamad H. and Li, Chenhao and Abyaneh, Amin and Houssaini, Anas and Ellis, Kirsty and Berseth, Glen and Hutter, Marco and Lin, Hsiu-Chin},
  booktitle = {Conference on Robot Learning (CoRL)},
  year      = {2026},
  url       = {https://arxiv.org/abs/2604.08780}
}
```
