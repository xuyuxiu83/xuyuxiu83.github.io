# 交接说明：academicpages 双语博客站

> 写于 2026-09-18。工作目录 `/home/xyx/site`。站点代码已全部改完但**尚未 commit**，本地 Docker 预览尚未跑通。

## 1. 目标

把 academicpages 模板做成 `https://xuyuxiu83.github.io`：左侧个人主页栏 + 按年份归档、可按分类筛选的博客，界面中英可切换。先推占位符版上线，个人资料留空由用户自己填。

## 2. 当前状态

| 阶段 | 状态 |
|---|---|
| 站点代码改造 | ✅ 完成 |
| 本地 Docker 预览 | ❌ 卡在 `bundle install` 下载 gem 超时 |
| 推送 + 开启 Pages | ⬜ 未开始 |

分支已从 `master` 改名为 `main`。remote 仍指向模板仓库：

```
origin  https://github.com/academicpages/academicpages.github.io.git
```

所有改动都在工作区（未 commit，部分删除已 staged、修改未 staged）。

## 3. 已完成的部分

### 精简模板
删除 publications / talks / teaching / portfolio / CV 及其集合、示例文件、`talkmap/`、`scripts/`、`markdown_generator/`、模板自带的 5 篇示例 post，以及 `.github/workflows/{scrape_talks,bad-pr}.yml`。

`scrape_talks.yml` 必须删：它每次 push 都会去抓已删除的 `_talks` 目录，必然失败。

### 站点配置 `_config.yml`
- `url: https://xuyuxiu83.github.io`、`baseurl: ""`、`repository: xuyuxiu83/xuyuxiu83.github.io`
- author 块里 `github: "xuyuxiu83"`
- permalink 改为 `/posts/:year/:month/:title/`
- 移除 collections 及其 defaults、`publication_category`、`talkmap_link`
- 姓名等仍是 `YOUR_NAME` 占位符（见第 8 节）

### 新增文件
| 文件 | 作用 |
|---|---|
| `_data/categories.yml` | 4 个分类：`personal-thoughts` / `paper-notes` / `book-notes` / `project-notes`，每条含 `en` / `zh` |
| `_data/i18n.yml` | 界面文案（`ui.*`、`archive.*`），每条含 `en` / `zh` |
| `assets/js/i18n.js` | 双语切换 |
| `assets/js/blog-filter.js` | 分类筛选 |
| `assets/css/blog-archive.css` | 筛选按钮样式 |
| `_pages/year-archive.html` | 年份归档页 |
| `_posts/*.md` | 3 篇示范，覆盖 3 个分类、2026 与 2024 两个年份 |
| `_drafts/post-draft.md` | 写作模板，含分类说明 |

### 改写的文件
`_includes/masthead.html`（加 EN/中文 切换按钮）、`_includes/author-profile.html`、`_layouts/single.html`、`_layouts/archive.html`、`_pages/about.md`、`_data/navigation.yml`、`_includes/head/custom.html`、`_includes/footer/custom.html`。

### 两套前端机制

**双语**：元素带 `data-i18n-en` / `data-i18n-zh` 属性，`i18n.js` 切换其 `textContent`，选择存在 `localStorage` 的 `site-lang` 键。只覆盖界面文字，正文不翻译 —— 用户写中文即中文。正文内如需双语，用同样的 `<span data-i18n-en="..." data-i18n-zh="...">` 写法，该机制在所有页面生效。已知取舍：浏览器标签页标题不随语言切换（只切页面 H1）。

**筛选**：`data-blog-filter-archive` 容器、`data-blog-filter` 按钮、`data-blog-category` 条目、`data-blog-year` 年份分组。`blog-filter.js` 隐藏不匹配的条目，并隐藏不含可见条目的年份分组。

### `Dockerfile`
- apt 源指向清华镜像（实测有效：apt 步骤从卡 15 分钟变成 0.3–4 秒）
- **gem 镜像那两行已撤掉，且不要加回来**。清华/中科大的 rubygems 镜像只镜像 gem 文件、不镜像 `/info/` 元数据接口（会 302 甩回 rubygems.org），依赖解析阶段要发几百次 `/info/` 请求，加了反而慢十倍。
- 显式装 `connection_pool:2.5.0` 和 `bundler:2.3.26`

### `Gemfile`
刻意保留 `github-pages` gem，让本地 gem 版本与线上 GitHub Pages 实际使用的一致，避免「本地好、线上坏」。代价是本地依赖图很大。

### `.github/workflows/jekyll-build.yml`
触发条件改成 `push: branches: [main]`。原本挂在已删除的 bad-pr 的 `workflow_run` 上，等于永不执行。它跑 `bundle exec jekyll build --strict_front_matter`，正好做云端构建校验。

## 4. 唯一卡点：本地 Docker 构建

`docker compose build` 失败，**bundler exit code 5**。

依赖解析本身已经快（< 30 秒，之前那个慢的问题已修好），大部分 gem 也装上了，但最后约 9 个 gem 并行下载时对 `rubygems.org:443` 超时：

```
Net::OpenTimeout: Failed to open TCP connection to rubygems.org:443 (execution expired)
IOError: HTTP session not yet started
An error occurred while installing jekyll-commonmark (1.4.0)
ERROR: process "/bin/sh -c bundle install" did not complete successfully: exit code: 5
```

超时的 gem：`faraday-net_http-3.4.4`、`eventmachine-1.2.7`、`dnsruby-1.74.0`、`rb-fsevent-0.11.2`、`rouge-3.30.0`、`ffi-1.17.4-x86_64-linux-gnu`、`minitest-6.0.6`、`execjs-2.10.2`、`jekyll-commonmark-1.4.0`。

（`github-pages 232` → `jekyll-commonmark-ghpages 0.5.1` → `jekyll-commonmark`，所以最后报的是 jekyll-commonmark。）

### 根因
宿主机直连 rubygems.org 不稳，需要走代理。但代理 `127.0.0.1:7890`（iKuuuVPNCore）**只监听回环**，容器内部默认访问不到。

### 解法（已实测可行）
构建时走宿主网络 + 宿主代理。已实测 `docker run --network host -x http://127.0.0.1:7890` 访问 rubygems.org 返回 200，耗时 0.28 秒。

## 5. 下一步：改 docker-compose.yaml 后重建

把 `build: .` 换成：

```yaml
services:
  jekyll-site:
    image: jekyll-site
    build:
      context: .
      network: host
      args:
        HTTP_PROXY: http://127.0.0.1:7890
        HTTPS_PROXY: http://127.0.0.1:7890
        NO_PROXY: localhost,127.0.0.1
    volumes: [ .:/usr/src/app ]
    ports: [ 4000:4000 ]
    user: 1000:1000
    environment: [ JEKYLL_ENV=docker ]
    command: jekyll serve -H 0.0.0.0 -w --config _config.yml,_config_docker.yml
```

`HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` 是 Docker 预定义构建参数，**不需要**在 Dockerfile 里声明 `ARG`。

```bash
docker compose build --progress=plain
docker compose up          # 站点在 http://localhost:4000
```

### 两个坑
1. **别用 `| tail -40` 接管道**。管道会缓冲到进程结束才输出，之前因此白等 16 分钟。用 `--progress=plain` 直接看输出。
2. **杀构建进程时模式要写成 `docke[r]`**，例如 `pkill -f "docke[r] compose build"`。直接写 `docker` 会匹配到执行它的 shell 自己，把自己杀掉（exit 144）。

## 6. 本地验证清单

- `/` 首页：侧边栏渲染正常（头像占位图、姓名、bio、location、employer、Email、GitHub 链接）
- `/year-archive/`：出现 2026 与 2024 两个年份分组；顶部按钮是「全部 / 个人思考 / 论文笔记 / 读书笔记 / 项目笔记」
- 点「论文笔记」→ 只剩 paper-note 那篇，2026 分组仍在
- 点「读书笔记」→ 只剩 2024 那篇，**且 2026 分组整块消失**（最容易出错的一条，务必验证）
- 点 EN / 中文 → 导航、侧边栏标签、归档页 H1 与按钮文字全部切换；**刷新后保持**（localStorage）
- 暗色模式按钮（主题自带）仍可用

快速冒烟测试：

```bash
curl -s localhost:4000/year-archive/ | grep -c data-blog-category
# 输出应等于文章数
```

### 尚未实测的 Liquid 风险点
`_pages/year-archive.html` 里 `{% assign first_section %}` 在 `for` 循环内的跨迭代赋值和 `<section>` 开合配对；以及 `post.categories | first` 在 front matter 写成 `categories: [paper-notes]` 时能否正确取到 slug。这两处只做过静态检查。

## 7. 推送上线步骤

```bash
# 1. 提交所有改动
git add -A && git commit -m "Convert academicpages into a bilingual blog with year archive"

# 2. origin 改名为 upstream，保留日后拉模板更新的能力
git remote rename origin upstream

# 3. 新增 origin，指向用户仓库（SSH 已验证，ssh -T 返回 Hi xuyuxiu83!）
git remote add origin git@github.com:xuyuxiu83/xuyuxiu83.github.io.git

# 4. 推送
git push -u origin main
```

5. **需要人到浏览器操作**：仓库 Settings → Pages → Source 选 "Deploy from a branch" → `main` / `(root)` → 保存

6. 盯 GitHub Actions 里 "Jekyll build" 的结果；若 `--strict_front_matter` 报错，按提示修完重推

入库后站点地址：`https://xuyuxiu83.github.io`

可选：`git fetch --unshallow` 补全历史（当前是 `--depth 1` 浅克隆），便于日后 `git blame`。非必需。

## 8. 剩给用户自己改的占位符

`_config.yml`：
- 第 12–15 行的 `YOUR_NAME`（站点标题 / 描述）
- `author:` 块里的 `name` / `name_zh` / `bio` / `bio_zh` / `location` / `location_zh` / `employer` / `employer_zh` / `email`（每对不带后缀是英文、带 `_zh` 是中文，留空则该条目不显示）

`images/profile.png`：现为模板占位头像。

## 9. 环境备注

- 本机网络不稳：rubygems.org 直连经常抖，docker hub 三个镜像也偶发 EOF。第一次构建失败的 `Net::OpenTimeout` 经查是瞬时抖动。
- `.gitignore` 里忽略了 `Gemfile.lock`。注意这会让每次 `bundle install` 都重新解析依赖（更慢）；如果本地构建太慢可以考虑去掉这条，但线上 Pages 用不到本地 lock 文件。
- **没有动过 VPN / 代理的任何配置。** 代理 `127.0.0.1:7890` 只监听回环，所以第 5 节才要走宿主网络。
- 本机 Docker base image 已是 Debian trixie。
