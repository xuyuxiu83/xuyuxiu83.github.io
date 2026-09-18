---
title: "Paper Notes: How I Read a Paper"
date: 2026-09-10
categories: [paper-notes]
tags: [reading, workflow]
---

这是一篇**示例文章**,用来演示「论文笔记」分类下的文章长什么样。你可以直接删掉它,或者把内容换成自己的。

## 第一遍:摘要 + 图表

先只读摘要、引言的最后一段,以及所有的图表和它们下面的说明文字。目的是判断这篇值不值得细读,而不是读懂细节。

## 第二遍:方法和实验

这时候再回到方法部分,边读边在纸上复现一遍数据流:输入是什么、每一步做了什么、输出到哪里去。说不清楚的地方就是没读懂的地方。

## 值得记下来的东西

- 它解决的问题,用一句话
- 核心假设是什么,这个假设在什么情况下会不成立
- 实验里哪个对比最能说明问题
- 有什么是我能直接拿过来用的

## 公式和代码都能写

行内公式写成 `$y = Wx + b$`,会渲染成 $y = Wx + b$;独立公式:

$$
\mathcal{L} = \frac{1}{N} \sum_{i=1}^{N} \| f(x_i) - y_i \|^2
$$

代码块:

```python
def read_paper(pdf):
    first_pass = skim_abstract_and_figures(pdf)
    if not first_pass.matters:
        return None
    return read_method_and_experiments(pdf)
```
