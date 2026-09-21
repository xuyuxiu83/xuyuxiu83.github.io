---
title: "ART-Glove：面向接触建模的人到机器人灵巧操作迁移"
date: 2026-09-21
categories: [research-ideas]
tags: [tactile-sensing, dexterous-manipulation, skill-transfer, contact-grounding]
---

## Contact-Grounded Policy 论文理解

### 论文信息

**Title**

Contact-Grounded Policy: Dexterous Visuotactile Policy with Generative
Contact Grounding

**Paper**

https://arxiv.org/abs/2603.05687

### TL;DR

Contact-Grounded Policy（CGP）关注的问题是：

> 如何让机器人在视觉触觉驱动下完成稳定的接触丰富型灵巧操作。

传统 imitation learning 通常学习：

    observation → action

即直接从视觉、触觉和状态预测机器人动作。

但是对于：

- 拧瓶盖
- 插拔
- 精细抓取
- 旋转操作

任务成功并不只取决于动作轨迹，而取决于：

- 接触发生的位置
- 接触关系是否稳定
- 手指之间是否形成约束
- 接触力是否合理

CGP 提出：

    observation

    ↓

    contact representation

    ↓

    robot action

将 contact state 作为动作生成之前的中间表示。

### 1. 为什么需要 Contact Grounding

人类执行操作时，并不会规划：

    index joint = xx°
    thumb joint = xx°

而是形成：

    稳定接触

    ↓

    调整手指运动

    ↓

    完成任务

因此直接复制动作存在 embodiment gap：

- 人手和机器人手结构不同
- 自由度不同
- 手指长度不同
- 接触位置不同

CGP 的核心观点：

> 跨本体迁移的关键不是复制动作，而是迁移接触语义。

### 2. Overall Framework

整体流程：

    Vision

     +

    Tactile

     +

    Proprioception

            |

            v

    Visuotactile Policy

            |

            v

    Generated Contact State

            |

            v

    Contact Grounding Module

            |

            v

    Robot Controller

            |

            v

    Dexterous Hand

主要包含：

1. Visuotactile Policy
2. Generative Contact Grounding
3. Contact-consistent Control

### 3. Visuotactile Policy

输入：

- RGB image
- tactile observation
- robot state

输出不是直接动作，而是未来接触状态：

    future contact distribution

例如：

拧灯泡任务：

    thumb:
     contact side surface

    index:
     provide rotation force

    middle:
     stabilize object

相比传统：

    image → joint command

CGP：

    image/tactile

    ↓

    contact prediction

    ↓

    joint command

增加了具有物理意义的中间层。

### 4. Generative Contact Grounding

传统方法：

    contact / no contact

只能判断是否接触。

CGP 生成更加丰富的接触状态：

- contact location
- contact region
- contact relationship
- future tactile response

因此称为 Generative Contact Grounding。

其目标类似：

预测：

    下一阶段应该形成怎样的接触状态

然后让控制器实现。

### 5. Contact Consistency Mapping

这是论文最关键的思想。

不同机器人：

    Human Hand

    Shadow Hand

    Allegro

    L20

动作空间完全不同。

例如：

人：

    finger trajectory

无法直接转换：

    robot joint trajectory

但是：

接触关系更加通用。

例如：

人：

    拇指压住侧面

    食指提供旋转

    中指保持稳定

机器人：

    thumb contact

    index support

    middle stabilization

因此：

    Action Space

            ×

    Contact Space

            ✓

### 6. 与 TactAlign / UniTacHand 的关系

#### TactAlign

核心：

    tactile alignment

解决：

人触觉和机器人触觉如何对应。

不足：

最终仍需要解决 action transfer。

---

#### UniTacHand

核心：

    Unified tactile representation

通过 MANO UV map：

统一触觉空间。

重点：

解决：

不同触觉传感器如何表达同一个接触。

---

#### CGP

核心：

    Contact representation

解决：

机器人应该形成怎样的接触。

三者关系：

    TactAlign:
    触觉怎么对齐


    UniTacHand:
    触觉怎么表示


    CGP:
    接触怎么执行

### 7. 对 ART-Glove 的启发

ART-Glove 当前路线：

    Human glove

    ↓

    retargeting

    ↓

    robot joint

存在问题：

人手动作和机器人动作空间差异巨大。

更自然的方向：

    ART-Glove

    (position)

    +

    (tactile)

    +

    (contact geometry)

            ↓

    Universal Contact Representation

            ↓

    Robot Hand

            ↓

    IK + compliant control

手套采集的数据不应该只是动作数据，而应该成为：

> 人类操作接触状态的数据源。

### 8. Potential Extension

结合 ART-Glove，可以进一步设计：

#### 1. 三维 Contact Capture

利用：

- 三轴力
- 接触位置
- 手指姿态
- 腕部位姿

构建：

    3D contact state

#### 2. Cross Embodiment Transfer

Human：

    ART-Glove

Robot：

    L20

    Shadow

    Allegro

中间通过：

    contact latent space

完成迁移。

#### 3. Two-stage Manipulation

更符合真实机器人：

Stage 1:

    Vision-based reaching

Stage 2:

    Contact-grounded manipulation

例如：

    机械臂靠近灯泡

    ↓

    建立接触

    ↓

    旋转操作

### 9. 总结

CGP 最大贡献不是提出更复杂的 policy network。

真正重要的是：

> 将灵巧操作从 action-centric 转变为 contact-centric。

传统：

    Human demonstration

    ↓

    Action imitation

CGP：

    Human demonstration

    ↓

    Contact understanding

    ↓

    Robot execution

对于未来：

- tactile glove
- human-to-robot transfer
- cross embodiment manipulation

提供了一种更自然的中间表示。

传感器：

- 压力手套
- 电阻阵列
- GelSight
- XELA

具有：

- 不同维度
- 不同空间分布
- 不同响应规律

因此：

同一个接触事件：

    human glove signal

    ≠

    robot tactile signal

---

## ART-Glove 接触迁移构想

### 相关工作分析

#### TactAlign

核心思想：

> 通过 tactile alignment 实现 human tactile 到 robot tactile 的迁移。

优势：

- 首次证明触觉对齐可以支持 human-to-robot transfer。
- 关注不同 embodiment 触觉表示之间的对应。

局限：

问题仍然停留在：

    human tactile

    ↓

    robot tactile

之后仍需要解决：

    aligned tactile

    ↓

    robot action

也就是说：

触觉域差异解决了，但是 action execution gap 仍然存在。

---

#### UniTacHand

核心思想：

> 不直接对齐传感器数值，而是在 MANO 手部空间建立统一触觉表示。

主要方法：

    Human tactile

            ↓

    MANO UV map

            ↓

    Robot tactile

再通过：

- contrastive learning
- latent alignment

得到共享触觉空间。

优势：

解决：

"接触发生在哪里"

这个问题。

因为不同手型虽然传感器不同，但是：

    thumb touching object

    index supporting object

具有相同语义。

局限：

UniTacHand主要解决：

    tactile representation gap

但是：

如何进一步生成机器人动作仍然依赖其他方法。

---

#### Human-Centric Transferable Tactile Pre-Training

该工作进一步扩大到大规模 human tactile pre-training。

核心思想：

利用大量人类触觉数据学习通用 tactile prior。

主要贡献：

- 构建大规模 H-Tac 数据集。
- 使用统一 tactile/action space。
- 通过 tactile prediction 建模接触动态。

其目标是：

    human tactile experience

    ↓

    robot manipulation prior

它说明：

未来机器人触觉学习的重要方向不是只采集机器人数据，而是利用人类数据进行预训练。

但是：

大规模数据路线仍然依赖：

- 统一表示
- action transfer mechanism

如何保证具体机器人执行仍是关键问题。

---

#### Contact-Grounded Policy

CGP 提供另一个视角：

> 跨 embodiment 不应该迁移动作，而应该迁移 contact state。

传统：

    observation

    ↓

    action

CGP：

    observation

    ↓

    contact state

    ↓

    controller target

    ↓

    robot action

核心区别：

policy 不负责直接控制所有关节。

而负责预测：

- 接触位置
- 接触关系
- 接触演化

随后由：

- IK
- impedance controller

完成执行。

---

### 3. 我们的核心假设

目前工作主要解决：

#### TactAlign

解决：

    tactile domain gap

#### UniTacHand

解决：

    tactile spatial representation

#### TTP

解决：

    large-scale tactile prior learning

#### CGP

解决：

    contact-grounded execution

但是仍然缺少：

> 高质量 human contact state 获取。

因此 ART-Glove 的价值不是简单采集动作。

而是：

提供 human contact supervision。

---

### 4. Proposed Idea

#### ART-Glove++:

构建：

    Human Contact Capture System

输入：

#### 1. 手指姿态

通过 encoder：

    finger joint

    fingertip pose

提供：

where the hand is

---

#### 2. 三维触觉

增加：

- normal force
- tangential force

提供：

    where contact happens

    how contact changes

    contact direction

---

#### 3. 腕部姿态

提供：

    global hand pose

最终形成：

    Human state:

    pose

    +

    contact

    +

    force

    +

    geometry

---

### 5. 核心方法：Contact-Centric Transfer

不是：

    human joint

    ↓

    robot joint

而是：

    Human demonstration

            ↓

    Contact Representation

            ↓

    Universal Contact Latent Space

            ↓

    Robot Contact Target

            ↓

    IK + impedance controller

            ↓

    Robot hand

---

### 6. 为什么 Contact 比 Action 更适合跨本体？

动作：

    human thumb joint angle

机器人无法直接对应。

但是：

任务需要：

    thumb contacts side surface

    index provides opposite force

这种关系在不同机器人之间更稳定。

因此：

Action space:

robot-specific

Contact space:

task-specific

---

### 7. 可能的方法框架

#### Stage 1: Human Contact Encoder

输入：

ART-Glove:

- pose
- tactile
- force

输出：

    z_h

---

#### Stage 2: Robot Contact Encoder

输入：

L20:

- tactile
- proprioception
- pose

输出：

    z_r

利用：

contrastive learning

使：

    z_h ≈ z_r

---

#### Stage 3: Contact Grounded Policy

输入：

- vision
- contact latent
- robot state

输出：

未来：

    contact trajectory

而不是：

joint trajectory。

---

#### Stage 4: Execution

通过：

- IK
- impedance control

转换：

    contact target

    ↓

    joint target

---

### 8. 可能的实验设计

任务：

#### 1. Screw bulb

验证：

旋转接触关系。

#### 2. Insertion

验证：

精细接触调整。

#### 3. Grasping

验证：

不同物体接触泛化。

比较：

##### Baseline 1

直接 action retargeting

##### Baseline 2

TactAlign style tactile alignment

##### Baseline 3

UniTacHand style tactile representation

##### Ours

Contact-grounded transfer

---

### 9. 最大难点

#### 难点1：Contact representation 如何定义？

需要回答：

什么信息才是真正的 manipulation skill？

可能包括：

- contact location
- force direction
- contact stability
- relative pose

---

#### 难点2：Human-robot pairing

是否需要严格 paired data？

可能方案：

少量 paired calibration:

    human glove

    +

    robot tactile

建立 mapping。

然后利用大量 human data。

---

#### 难点3：Robot execution

contact latent 最终如何变成：

L20动作？

需要：

- IK
- optimization
- impedance controller

---

### 10. 我认为相比已有工作的优势

#### 相比 TactAlign

不是只对齐 tactile。

而是：

    tactile

    +

    pose

    +

    force

构建完整 contact state。

---

#### 相比 UniTacHand

不是只解决：

    where is contact

进一步解决：

    how to execute contact

---

#### 相比 TTP

不是追求大规模数据。

而强调：

高质量 human contact supervision。

---

#### 相比 CGP

不是从 robot tactile 学 contact。

而直接从 human demonstration 获取 contact prior。

---

### 11. 最终论文故事

一句话：

> We propose a contact-centric human-to-robot transfer framework enabled
> by a high-fidelity tactile glove, where human demonstrations are
> transformed from embodiment-specific motions into transferable contact
> representations for dexterous robot manipulation.

核心贡献：

1. ART-Glove++: 高质量三维 contact capture

2. Contact Representation: 跨 embodiment 的操作语义表示

3. Contact-Grounded Transfer: 从 human contact 到 robot execution

---

### 12. 希望讨论的问题

1. Contact representation 应该采用什么形式？

    -   explicit contact map?
    -   force field?
    -   latent embedding?

2. Human tactile 和 robot tactile 是否必须完全对齐？

3. 是否应该沿用 UniTacHand 的 MANO space？

4. contact target 是否比 action prediction 更适合灵巧操作？

5. 第一篇论文应该偏：

    -   hardware + representation
    -   还是 representation + policy？
