---
title: "VOCALoco: Viability-Optimized Cost-aware Adaptive Locomotion"
date: 2025-10-28
authors: ["Stanley Wu", "Mohamad H. Danesh", "Simon Li", "Hanna Yurchyk", "Amin Abyaneh", "Anas El Houssaini", "David Meger", "Hsiu-Chin Lin"]
venue: "IEEE RA-L 2025"
venueNote: "presented at ICRA 2026"
tags: ["legged locomotion", "reinforcement learning", "skill selection", "robot learning"]
description: "VOCALoco predicts viability and cost of transport from heightmaps to select safe, efficient locomotion skills for quadrupeds on stairs."
summary: "VOCALoco predicts the viability and cost of transport of several pretrained locomotion skills from local heightmaps, then executes the safest, most efficient one. It improves robustness on stair ascent and descent over an end-to-end DRL policy and transfers to a real ANYmal-D quadruped."
links:
  - name: Paper
    url: https://arxiv.org/abs/2510.23997
  - name: IEEE Xplore
    url: https://ieeexplore.ieee.org/abstract/document/11248861
  - name: Project page
    url: https://sites.google.com/view/vocaloco
media:
  image: "media/intro-fig-small_page-0001.jpg"
  alt: "Overview of the VOCALoco framework showing skill viability prediction and selection."
cover:
  image: "media/intro-fig-small_page-0001.jpg"
  alt: "Overview of the VOCALoco framework showing skill viability prediction and selection."
  relative: true
---

## Abstract

Recent advancements in legged robot locomotion have facilitated traversal over increasingly complex terrains. Despite this progress, many existing approaches rely on end-to-end deep reinforcement learning (DRL), which poses limitations in terms of safety and interpretability, especially when generalizing to novel terrains. To overcome these challenges, we introduce VOCALoco, a modular skill-selection framework that dynamically adapts locomotion strategies based on perceptual input. Given a set of pre-trained locomotion policies, VOCALoco evaluates their viability and energy-consumption by predicting both the safety of execution and the anticipated cost of transport over a fixed planning horizon. This joint assessment enables the selection of policies that are both safe and energy-efficient, given the observed local terrain. We evaluate our approach on staircase locomotion tasks, demonstrating its performance in both simulated and real-world scenarios using a quadrupedal robot. Empirical results show that VOCALoco achieves improved robustness and safety during stair ascent and descent compared to a conventional end-to-end DRL policy.

![Real-world stair experiments with VOCALoco](media/real-world-small_page-0001.jpg)

## Citation

```bibtex
@article{wu2025vocaloco,
  title   = {VOCALoco: Viability-Optimized Cost-aware Adaptive Locomotion},
  author  = {Wu, Stanley and Danesh, Mohamad H. and Li, Simon and Yurchyk, Hanna and Abyaneh, Amin and El Houssaini, Anas and Meger, David and Lin, Hsiu-Chin},
  journal = {IEEE Robotics and Automation Letters},
  volume  = {11},
  number  = {2},
  pages   = {1146--1153},
  year    = {2025},
  doi     = {10.1109/LRA.2025.3632604},
  url     = {https://doi.org/10.1109/LRA.2025.3632604}
}
```
