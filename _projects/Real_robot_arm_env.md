---
layout: page
title: Real Robot Arm Environment
description: Custom Robot Arm Env for Real Data Collection/Policy Deployment.
img: assets/img/main_final_project.jpg
importance: 2
category: work
related_publications: false
---


## Introduction

Let’s be real: simulations are amazing, until you remember that robots are actually made to exist (and do stuff!) in the real world. When I first started getting into robotics, everyone kept saying two things:

1. **“ROS sucks!”** (and the more optimistic ones add, **“But it’s the best we’ve got…”**)
2. **“Try it in a simulator.”**

Simulations can be fantastic for early testing and debugging. They’re reproducible, they’re (relatively) cheap, and you don’t have to worry about your robot destroying itself. But here’s a fact you can’t escape: real robots, real hardware, real environment. That’s the only thing that truly matters once you move beyond code into the physical world.

As the old saying that I just made up right now goes: it’s way cooler to see a real robotic arm peel an orange than to watch it “cook, drive a plane, and play chess” in a simulator. 

With that in mind, I decided to build a fully functional robot arm environment—something safe, solid, and ready for my experiments. In this blog post, I’m going to share the entire process: from design to assembly to getting everything powered and ready for some sweet, sweet data collection.



## Why a Real Robot Environment?

You might be asking: “Why build a custom table/cage setup in the first place?” Well, simple: **my old environment was terrible.** (Yes, I needed a table because my previous setup was… let’s just say ‘suboptimal.’)

- **Stability:** Throwing a heavy robotic arm onto a flimsy table is basically a recipe for everything toppling over.
- **Safety:** Having a dedicated environment where you can bolt everything down, add kill switches, and properly manage cables is worth more than gold. 
- **Scalability:** With a sturdy environment, you can keep adding sensors, extra arms, cameras, lights...



"assets/img/IMG_3453.jpg"


As you can see my initial set up is very dangerous and it's very annoying to set up every single time...

## Step 1: The Design

**Key Consideration: Cost**

Money is scarce resources, especially in research where everybody complains about it. I convinced my supervisor that the env would cost around  **\$1500**, which might sound like a lot or a little, depending on your project scope. In reality, you can source most of the necessary materials (extrusions, brackets, plywood, cables) from places like Amazon, AliExpress, or local hardware stores. 

**Online Tools**


"assets/img/IMG_3483.jpg"


Even though you can totally draft this on paper (it’s just a table, not a rocket), I used [Vention’s online builder](https://www.vention.io/) to visualize my idea. It’s like if Canva and Fusion 360 had a baby specialized in industrial setups. They have all sorts of aluminum extrusion models and accessories so you can plan how everything will fit together in 3D. But be warned: **Vention itself can be pricey,** so I used it mainly as a design tool, then sourced the actual parts elsewhere. It was 3X more expensive...


## Step 2: Building the Frame

### Choosing Aluminum Extrusions

I’ve worked with a bunch of different materials over the years, and **aluminum extrusions** are my go-to for making a robust frame. They’re light, strong, easy to work with, and they don’t rust. Plus, you can attach things to them without needing to drill a thousand holes.

Here’s what I used:
- Four **8080 extrusions (80 mm × 80 mm)** for the table’s vertical legs (“feet”). These are thick, beefy columns. The “8080” basically means each side is 80 mm wide, forming a nice square cross-section.
- **8040 extrusions** (80 mm × 40 mm) for the horizontal perimeter beams of the table. These create the top frame that holds the tabletop.

"assets/img/IMG_3647.jpg"


I chose 8080 for the legs because they can handle a lot of weight and vibration without wobbling. For attachments, I used **T-slot nuts** with ball bearings so that the connection stays snug and won’t shuffle around under stress. Then I used **corner brackets** wherever needed to ensure the frame remained rigid. I also had two 4040 pillars go through the middle so that it limits the table top wobbling.

### Height & Dimensions

A good robot worktable is typically around **30 inches (76 cm)** tall—or a bit taller if that’s more ergonomic for your use case. My table is somewhere around 80 cm, which works nicely for me. Measure your lab or workspace carefully.


## Step 3: Adding the Cage

I wanted a sort of “cage” or overhead structure on top of my table to mount:

- Lights  
- Cameras  
- Extra sensors  
- Anything else that might need overhead rigging

Because the cage doesn’t bear much weight or stress, I used **4040 extrusions**. It’s basically a rectangular structure extending above the table, with vertical posts at the corners and crossbeams on top. This allows you to attach cameras in all sorts of angles.

### Tabletop Installation

For the tabletop, I grabbed a **thick plywood sheet**. Don’t skimp here; you want something that can handle repeated drilling, screwing, and the weight of your robot without warping. I had my university’s workshop cut it to the exact dimensions I needed.

"assets/img/IMG_3760.jpg"

**Pro Tip:** Cut off the corners of the tabletop if your cage legs attach right at the table’s corners. That way, the aluminum posts can align flush with the frame.

**Flush Screws**  
I used a **step drill bit** to create funnel-shaped holes in the plywood, allowing the screw heads to sit flush with the surface. Looks neat, and the robot’s base can sit directly on top without rocking on a protruding screw.

---

## Step 4: Power Management and Safety

### Power Strip & Cables

I attached a **12-outlet power strip** along one side of the table. This is a total lifesaver. Robotics experiments inevitably lead to connecting lots of devices like arms, sensors, lights, single-board computers, you name it. Having a big, well-secured power strip means everything is accessible and you’re not tripping over extension cords.

### The All-Important Kill Switch

No self-respecting robotics setup should be without an **emergency kill switch**. If (when) your robot decides it’s time to rebel (or most likely your code is made by chatgpt), you want a giant red button that kills power to robots instantly. I mounted mine on the side of the frame. 

---

## Step 5: Mounting Sensors and Setting Up Lighting

### Cameras

For depth perception and all the fancy stuff, I use **Intel RealSense** cameras:
1. One is clamped in front on a little monopod (attached to the table edge).
2. The other is mounted on the overhead cage via a custom 3D-printed bracket.

These positions help me capture different angles and feed data back into my system for object detection, tracking, and all that good vision-based robotics stuff.

### Lights

You need good lighting if you’re doing any kind of computer vision. I picked up some affordable **USB-powered LED lights** from Amazon. These attach to the overhead extrusions. They’re bright enough to illuminate my workspace without blowing out the camera exposure.

---

## Step 6: Bringing in the Robots

Finally, the fun (and sometimes terrifying) part: **the robot arms**. We had two **Kinova Jaco** arms, which are wonderful (but old) because:

- Controlled via Ethernet (plugged into my switch).
- They’re relatively safe, with configurable velocity limits (keep that kill switch in reach!).


"assets/img/IMG_3798.jpg"

"assets/img/IMG_3843.jpg"

I placed them so that the base is firmly attached (Later one I used a optical plate we had, which is a fancy word for a aluminum plate with M8 Holes on it) onto the tabletop, with the cables running underneath to my **power distribution unit**. That distribution unit then feeds into the main power strip, all behind the kill switch. 

**Important:** Make sure you secure the robot base very well. The last thing you want is your robot deciding it’d like to take a stroll across your lab bench.



---

## Step 7: Testing and Next Steps


Once the safety "borders" are set up I could easily control the arm through Rviz and project the 3D coloured depth on. It works like magic and now next steps that need to be figured out are how to collect and deploy safely.... 

Most importantly, I want to keep this environment flexible so I can try new methods of controlling the robot (joint control, end-effector control, torque control—maybe even direct brain interface if I go off the deep end).

## Anyway

This setup wasn’t super hard to build, but it does require thoughtful planning. From a cost perspective, you can definitely source cheaper materials if you don’t need industrial grade extrusions. The main point is:

- **Don’t rely on simulation forever.** Real-world experiments are where it’s at.
- **A solid, safe environment** is critical for serious robotics work.
- **A kill switch** is non-negotiable.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/IMG_4095.jpg" title="Final Setup" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

That’s all for now. 










/workspaces/anashoussaini.github.io/assets/img/main_final_project.jpg

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/main_final_project.jpg" title="Final Table" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    This is what the final project ended up looking like.
</div>

 Caption photos easily. On the left, a road goes through a tunnel. Middle, leaves artistically fall in a hipster photoshoot. Right, in another hipster photoshoot, a lumberjack grasps a handful of pine needles.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/1.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/3.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    
    Caption photos easily. On the left, a road goes through a tunnel. Middle, leaves artistically fall in a hipster photoshoot. Right, in another hipster photoshoot, a lumberjack grasps a handful of pine needles.

</div>


You can also put regular text between your rows of images, even citations {% cite einstein1950meaning %}.
Say you wanted to write a bit about your project before you posted the rest of the images.
You describe how you toiled, sweated, _bled_ for your project, and then... you reveal its glory in the next row of images.

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    You can also have artistically styled 2/3 + 1/3 images, like these.
</div>

The code is simple.
Just wrap your images with `<div class="col-sm">` and place them inside `<div class="row">` (read more about the <a href="https://getbootstrap.com/docs/4.4/layout/grid/">Bootstrap Grid</a> system).
To make images responsive, add `img-fluid` class to each; for rounded corners and shadows use `rounded` and `z-depth-1` classes.
Here's the code for the last row of images above:

I'll create a blog post based on your requirements, detailing the process of designing and building the robotic arm environment. It will follow a structured format covering the design phase, extrusion ordering, assembly, wood cutting and drilling, lighting, electrical setup, safety measures, and software integration using ROS1, Rviz, and Intel RealSense cameras.

I'll also ensure the images are placed under `assets/` in the blog post structure.

### Blog Structure:
1. **Introduction** – Overview of the project
2. **Design Phase** – Planning and CAD modeling
3. **Ordering and Preparing Materials** – Extrusions, boards, screws, and metal plate
4. **Assembly of the Table** – Putting extrusions together, securing the board
5. **Electrical and Safety Components** – Adding power, safety button, and lighting
6. **Software Integration** – ROS1, Rviz, 3D depth mapping, and interactive arm control
7. **Final Setup and Testing** – Running the environment and optimizing performance

I'll now draft the blog post. Stay tuned!

# **Building a Robotic Arm Learning Environment with JACO Arms**

## **Introduction**
The goal of this project was to design and construct a modular learning environment for robotic arms, specifically using **JACO Arms**. This environment serves as a **real-world testing ground** for robotics research, featuring **precision machining**, a **structured workspace**, **safety measures**, and a **dedicated computing system** for control and visualization. 

This blog post documents the **design process**, **construction steps**, and **software integration** using **ROS1**, **Rviz**, and **Intel RealSense 435i cameras** to create a **3D depth map** for robotic control.

---

## **1. Design and Planning Phase**
The first step involved designing the **workspace layout**. This included:
- **CAD modeling** of the table structure using **4080 aluminum extrusions**.
- Planning the **mounting points** for the JACO robotic arm.
- Ensuring the work surface could **accommodate various robotics experiments**.

A critical component was integrating a **metal plate with M8 aluminum holes**, similar to an **optical table**, for **precision positioning**.

---

## **2. Ordering and Preparing Materials**
To build the setup, we sourced the following components:
- **4080 Aluminum Extrusions** (to form the table frame)
- **Pre-cut Wood Panel** (for the main surface)
- **M8 Hole Aluminum Plate** (for robotic arm mounting)
- **Counterbore Screws** (for flush attachment)
- **Power Strip and Safety Button** (for electrical safety)
- **Intel RealSense 435i Cameras** (for 3D depth sensing)
- **Dedicated Computing System** (to run the robotics environment on ROS1)

---

## **3. Assembling the Table**
Once the materials arrived, the next step was assembling the **structural frame**:
- Connecting the **4080 extrusions** using **corner brackets**.
- Ensuring **stability** using **reinforcement plates**.
- Mounting the **wooden tabletop**, ensuring that counterbore screws fit **flush** with the surface.

### **Drilling and Mounting**
- Drilled precise **holes** in the wood surface.
- Aligned and attached the **M8 hole aluminum plate** to form the **robotic workspace**.
- Ensured the **JACO Arm** had a **secure mounting point**.

---

## **4. Electrical & Safety Setup**
To ensure a **safe and functional** workspace, we integrated:
- **Lighting fixtures** for clear visibility.
- **Power strip** mounted on the side.
- **Emergency Stop Button** for immediate shutdown.
- **Cable Management** to avoid clutter.

---

## **5. Software & Robotic Control**
With the physical setup complete, we moved to software integration:
- **Installed ROS1** on the dedicated machine.
- Configured **Rviz** to visualize and interact with the **JACO arm**.
- Used **Intel RealSense 435i cameras** to create a **3D depth map**.
- Enabled **interactive control** of the robotic arm for research applications.

---

## **6. Final Testing & Optimization**
- Verified the **stability of the robotic arm** under different loads.
- Optimized the **depth sensing accuracy**.
- Ran **various test scenarios** using **Rviz and ROS1**.

---

## **7. Conclusion**
This robotic arm learning environment is now fully operational and provides a **structured, real-world workspace** for robotic research. By combining **precision engineering, safety measures, and software integration**, this setup enables advanced **robotic manipulation and 3D perception**.

---

### **Image Gallery**
The following images showcase different stages of the project, from **assembly to final integration**.

#### 📷 **Workspace Construction**
![Building the Table](assets/img/IMG_3649.jpg)
![Frame Assembly](assets/img/IMG_3453.jpg)
![Mounting the Work Surface](assets/img/IMG_3716.jpg)

#### 🤖 **Robotic Arm Integration**
![JACO Arm Installed](assets/img/IMG_3798.jpg)
![Testing with Intel RealSense](assets/img/IMG_3819.jpg)
![Final Setup with Computer](assets/img/IMG_4481.jpg)

This marks the **completion of the build**, but research and experiments on this **JACO Arm Environment** will continue. 🚀
