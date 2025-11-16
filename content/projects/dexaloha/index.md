---
title: "DexALOHA: A Low cost 5-Finger Cable-Driven Hand"
date: 2025-02-01
tags: ["robotics", "dexterous manipulation", "3D printing", "cable-driven hand", "kinova jaco"]
author: ["Achraf Anas El Houssaini"]
description: "Assembling and extending DexAloha, a ~$300 five-finger, cable-driven hand based on HOPE JR, with a custom wrist for the Kinova Jaco and a Hall-effect sensing glove."
summary: "DexAloha is my build of the open-source HOPE JR hand: I assembled it, designed a custom motorized wrist that plugs into a Kinova Jaco, and (with Martino Russi) adopted an improved finger design that is easier to assemble and route cables through."
cover:
    image: "project_assets/front_view.jpg"
    alt: "DexAloha hand"
    relative: true
showToc: true
disableAnchoredHeadings: false
---

![DexAloha hand mounted on the Jaco](/project_assets/IMG_5790.jpg)

## Introduction

DexAloha started from a simple idea: **take an open-source, low-cost hand and make it play nicely with a real robot arm**.

The actual core hand design is **not mine** – it comes from the open-source **HOPE JR** project. What I did here was:

- **Print and assemble** the HOPE JR hand,
- Design and build a **custom wrist module** so it bolts directly onto a **Kinova Jaco**,
- Tweak the **cable routing**,
- And, courtesy of my friend **Martino Russi (Hugging Face)**, switch to an improved **finger design** that’s thicker, easier to assemble, and uses **M2 screws** instead of tiny fishing clamps.

<p align="center">
  <video
    controls
    src="project_assets/video_metal.mp4"
    title="DexAloha"
    style="max-width: 720px; width: 100%; display: block; border-radius: 8px;">
  </video>
</p>


So DexAloha is:

- 5 fingers, cable-driven with fishing line
- ~**\$300** in parts for the hand
- **18 DOF** total
  – 3 per finger
  – +2 for the wrist
- Driven by **FEETECH** servos in a custom wrist module
- A **Hall-effect glove** (work in progress) for teleoperation and demos

![Three Frame](/project_assets/front_view.png)

This page walks through the main pieces: printing and assembling the HOPE JR hand, building a finger (including the new design), designing the wrist for the Jaco, wiring the FEETECH motors, and eventually constructing the glove.

---

## Printing & Assembling the Hand

The core geometry of DexAloha still **comes from HOPE JR**: finger joints, tendon paths, and overall proportions. I didn’t redesign the mechanism from scratch; I used their models as the base and focused on making them **real and usable on my setup**.

In practice, going from a Git repo to a physical hand still means:

1. **Slicing and printing** all the parts,
2. Cleaning up surfaces and holes,
3. Test-fitting joints and tendons,
4. Reprinting the parts that reality didn’t like.

![Printed DexAloha parts laid out on the table](/project_assets/3d_printed_parts.jpg)

I printed the hand in multiple batches:

- **Palm and backplate**: the main shell that houses the cable exits and anchors.
- **Five sets of finger segments**: proximal, middle, distal, and fingertip parts.
- **Cable guides and pulleys**: tiny parts that matter a lot for friction.

Because this is cable-driven, the quality of the **holes, grooves, and rounded corners** is critical. Any sharp edge becomes a cable-eating device. So after printing:

- I chamfered and lightly sanded all tendon paths.
- I did a dry run with **dummy fishing line** to make sure the routing doesn’t snag.

Even though HOPE JR provides the base design, DexAloha still required tweaking clearances and reprinting a couple of parts until the routing felt smooth on my printer + filament + tolerances.

---

## Assembling a Finger (and the New Design)

Each finger is its own little project. A DexAloha finger has **around four pieces**:

1. Base segment
2. Middle segment
3. Distal segment
4. Fingertip / cap

![One DexAloha finger exploded view](/project_assets/finger.jpg)

The original HOPE JR finger design works, but it was a bit painful to assemble: small features, tight holes, and cable terminations that were not super friendly for repeated experiments. This is where **Martino Russi** stepped in with a nicer variant that I ended up using:

- **Thicker finger links** → more robust and less flexy,
- **Bigger holes** → easier routing and less fighting with the fishing line,
- **M2 screws** for fastening → instead of relying on awkward clamps everywhere.

So the basic build flow with the new fingers is:

- **Press-fit or pin/screw** the joints between segments so they can rotate cleanly.
- Run **fishing line** through the finger along the built-in channels and enlarged holes.
- Anchor the line at the fingertip and route it back toward the palm where the servo spool sits.

We experimented with **different routing patterns** for the fishing line:

- Symmetric vs. offset paths around the joints,
- Single line vs. dual-line per finger,
- Different wrapping strategies around the servo horn.

The goal was to find a pattern that:

- Gives a **smooth flexion curve**,
- Minimizes slack and hysteresis,
- Doesn’t chew through the cable in 10 flexes.

Once a single finger behaved well (no grinding, decent range of motion), we replicated the process across all five fingers with the improved geometry.

---

## Custom Wrist for the Kinova Jaco

The original HOPE JR design doesn’t care what robot it mounts on. For DexAloha, the constraint was clear:

![CAD on a JACO](/project_assets/250d8b63-48a7-4bbc-98e8-6e8117b79d5d.jpg)

> The whole thing needs to behave like a **Jaco tool**:
> same bolt pattern, clean wiring path, and a compact, robust wrist.

This part **is custom**.

We designed a **wrist module** that:

- On one side, interfaces mechanically with the **Jaco flange** (same bolt circle & alignment).
- On the other side, houses:
  - A set of **FEETECH servos** for the fingers,
  - Two larger FEETECH servos for **wrist motion**,
  - Cable guides so the fishing lines exit cleanly into the palm.

![wrist view](/project_assets/cabledriven3frame.png)

The result:

- **18 DOF** total:
  - 3 DOF × 5 fingers = 15 DOF
  - 2 DOF for the wrist (flexion/extension + radial/ulnar or yaw/pitch, depending on configuration)
- The wrist directly **bolts into the Jaco** like any other tool.
- Power and signal lines are routed through the wrist body, so there’s no spaghetti at the flange.


## Where’s the learning?

If you’re wondering where the **transformers, VLAs, and “actual learning”** come in: DexAloha is the hardware playground for that next step. The goal is to use this underactuated, high-DOF hand as a testbed for **vision–language–action policies** and transformer-based controllers,  how we collect data, train those models, and deploy them on the real hand will be the topic of a separate blog post.


---
