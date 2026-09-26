---
title: "DexSuite: A Unified Simulation Framework for Dexterous Manipulation"
date: 2026-07-01
authors: ["Anas Houssaini", "Hugo He", "Junming Shi", "Amin Abyaneh", "Ricardo Chahine", "Shuo Wen", "Mohamad H. Danesh", "Theophile Soulie", "Mariana Sosa Guzmán", "Mathias Desrochers", "Rayan Houssaini", "Marcus Kam", "Charlotte Morissette", "Martino Russi", "Jonathan Lussier", "Gregory Dudek", "Doina Precup", "Hsiu-Chin Lin", "David Meger"]
tags: ["dexterous manipulation", "simulation", "benchmark", "imitation learning", "teleoperation"]
description: "DexSuite: a modular simulation framework and benchmark for multi-fingered dexterous manipulation, with Manus-glove teleoperation and an expert dataset."
summary: "DexSuite is a modular simulation framework and benchmark for multi-fingered hands, standardizing observations, actions, and evaluation across 20+ arm–hand configurations, single-arm and bimanual tasks, and rigid, articulated, and deformable objects. It ships with a Manus-glove teleoperation toolchain and an expert demonstration dataset."
links:
  - name: Project page
    url: https://dexsuiteorg.github.io/
media:
  video: "media/pan.mp4"
  poster: "media/pan.webp"
  image: "media/overview.webp"
  alt: "A multi-fingered robot hand picking up a pan and placing it, simulated in DexSuite."
  gallery:
    - video: "media/pan.mp4"
      poster: "media/pan.webp"
      caption: "Pan pick-and-place"
    - video: "media/mug.mp4"
      poster: "media/mug.webp"
      caption: "Mug pick-and-place"
    - video: "media/coffee.mp4"
      poster: "media/coffee.webp"
      caption: "Making coffee with a UR arm and an Allegro hand"
cover:
  image: "media/overview.webp"
  alt: "Overview of the DexSuite framework."
  relative: true
---

## Abstract

Dexterous multi-fingered hands promise far richer manipulation skills than simple parallel grippers, yet most existing benchmarks and datasets still target low-DoF end-effectors. In an era where increasingly advanced physical hands are being developed at high speed, we lack a unified, low-cost simulation and benchmarking environment to study dexterous control. We introduce DexSuite, a modular framework that standardizes observations, action spaces, and evaluation protocols for multi-fingered hands while remaining easily extensible to new robots, environments, and tasks. Alongside the framework, we release a curated dataset of over 150k frames of multi-modal hand interaction, collected with a Manus glove on a suite of manipulation tasks, providing high-fidelity supervision of finger motion and contact-rich interactions. DexSuite also offers benchmark tasks and baselines spanning imitation learning, reinforcement learning, and diffusion policies, enabling fair comparison across algorithm families and hand representations, and providing a common testbed for systematic study of robotic dexterity.

![Overview of the DexSuite framework](media/overview.webp)

## Framework

DexSuite separates a base environment from modular tasks and uses robot abstractions to pair any manipulator with any gripper or multi-finger hand, in single-arm or bimanual settings, across rigid, articulated, and deformable objects. It ships with a teleoperation and data toolchain (keyboard, Vive trackers, and Manus gloves with geometric retargeting), dataset loaders in the LeRobot format with converters to RoboMimic and RLDS, and a curated benchmark of environments spanning more than twenty arm–hand configurations.
