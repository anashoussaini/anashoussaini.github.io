---
title: "Drift Q-Learning"
date: 2026-05-29
weight: 1
authors: ["Anas Houssaini*", "Mohamad H. Danesh*", "Amin Abyaneh", "Scott Fujimoto", "Hsiu-Chin Lin", "David Meger"]
venue: "NeurIPS 2026"
tags: ["offline RL", "reinforcement learning"]
description: "DriftQL: one-step offline RL that replaces diffusion and flow denoising with a drift regularizer and critic-driven improvement. SOTA on D4RL and OGBench."
summary: "DriftQL is a one-step offline RL policy that replaces diffusion and flow denoising with a learned drift field: attraction keeps actions on the data, repulsion keeps them diverse, and the critic tilts them toward high value. State of the art on D4RL and OGBench, and robust to noisy datasets."
links:
  - name: Paper
    url: https://arxiv.org/abs/2606.00350
  - name: Code
    url: https://github.com/anashoussaini/driftql
  - name: Project page
    url: https://driftql.github.io/
media:
  video: "media/teaser.mp4"
  poster: "media/teaser.webp"
  image: "media/overview.webp"
  alt: "Animated walkthrough of DriftQL: sampling candidate actions, computing the drift field from attraction and repulsion, and the training loss."
  gallery:
    - video: "media/teaser.mp4"
      poster: "media/teaser.webp"
      caption: "DriftQL in one minute: candidate actions, the drift field, and the training objective"
cover:
  image: "media/overview.webp"
  alt: "Attraction, repulsion, and critic signals shaping the DriftQL drift field."
  relative: true
---

## Abstract

Offline reinforcement learning requires improving a policy from fixed data while avoiding out-of-distribution actions with unreliable value estimates. Diffusion and flow policies handle this trade-off by modeling the behavior distribution to regularize the RL objective, but they require iterative denoising, solver integrations, and in more efficient variants, distillation or other approximations at inference. We propose DriftQL, which combines a drift-based behavioral regularizer with critic-driven policy improvement. The value signal biases the policy toward high-value regions of the data support, while attraction and repulsion together keep generated actions near the data and prevent collapse onto a single mode. DriftQL is implemented as a single network with a unified training objective and generates actions in a single forward pass. On D4RL and OGBench, DriftQL consistently outperforms diffusion and flow methods, advancing the state of the art. Under degraded data quality, where the baselines visibly struggle, DriftQL remains close to its clean-data performance, positioning it as a promising alternative to diffusion and flow-based methods while maintaining the simplicity and efficiency of deterministic approaches.

![Attraction, repulsion, and critic signals shaping the DriftQL drift field](media/overview.webp)

## Citation

```bibtex
@inproceedings{houssaini2026drift,
  title     = {Drift Q-Learning},
  author    = {Houssaini, Anas and Danesh, Mohamad H. and Abyaneh, Amin and Fujimoto, Scott and Lin, Hsiu-Chin and Meger, David},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year      = {2026},
  url       = {https://arxiv.org/abs/2606.00350}
}
```
