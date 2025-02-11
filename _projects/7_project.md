---
layout: page
title: Real Robot Arm Environment
description: Custom Robot Arm Env for Real Data Collection/Policy Deployment.
img: assets/img/4.jpg
importance: 2
category: work
related_publications: false
---

Every project has a beautiful feature showcase page.
It's easy to include images in a flexible 3-column grid format.
Make your photos 1/3, 2/3, or full width.

To give your project a background in the portfolio page, just add the img tag to the front matter like so:

    ---
    layout: page
    title: project
    description: a project with a background image
    img: /assets/img/12.jpg
    ---


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects/jaco_table_environment/IMG_3819 (1).jpg" title="Final Table" class="img-fluid rounded z-depth-1" %}
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

I'll also ensure the images are placed under `assets/projects/jaco_table_environment/` in the blog post structure.

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
![Building the Table](assets/img/rojects/jaco_table_environment/IMG_3649.jpg)
![Frame Assembly](assets/img/projects/jaco_table_environment/IMG_3453.jpg)
![Mounting the Work Surface](assets/img/projects/jaco_table_environment/IMG_3716.jpg)

#### 🤖 **Robotic Arm Integration**
![JACO Arm Installed](assets/img/projects/jaco_table_environment/IMG_3798.jpg)
![Testing with Intel RealSense](assets/img/projects/jaco_table_environment/IMG_3819.jpg)
![Final Setup with Computer](assets/img/projects/jaco_table_environment/IMG_4481.jpg)

This marks the **completion of the build**, but research and experiments on this **JACO Arm Environment** will continue. 🚀
