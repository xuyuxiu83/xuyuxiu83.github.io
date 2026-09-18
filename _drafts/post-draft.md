---
# 草稿模板。_drafts 里的文章默认不会被构建,想预览时用
#   docker compose run --rm --service-ports jekyll-site jekyll serve -H 0.0.0.0 --drafts --config _config.yml,_config_docker.yml
# 文件名不用写日期,发布时移到 _posts/ 并改成 YYYY-MM-DD-标题.md
title: "文章标题"
date: 2026-09-18
# categories 决定它在博客归档页归到哪个筛选按钮下,
# 可选值见 _data/categories.yml:personal-thoughts / paper-notes / book-notes / project-notes
categories: [personal-thoughts]
tags: [tag-one, tag-two]
---

第一段会被自动截取成归档页上的摘要,所以它最好能独立成句。

正文从这里开始。
