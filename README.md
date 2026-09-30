# 致 鸥黑米 · 生日快乐

一个纯静态的生日祝福网站（白粉樱花 · 明亮），可以直接部署到 GitHub Pages / Vercel / Netlify，
也可以本地双击 `启动网站.bat` 打开。

**已部署**：<https://xiex16070-jpg.github.io/ouheimi-birthday/>
仓库：<https://github.com/xiex16070-jpg/ouheimi-birthday>（public）
> 仓库是公开的，Anyone with the link 都能看到源码里的图。已加 `robots.txt` + `noindex` 防止被搜索引擎收录。
> 若想彻底不公开，需要 GitHub Pro 才能给私有仓库开 Pages，或者改用 Vercel 部署私有仓库。

---

## 一、六幕演出

| 幕 | 内容 |
|---|---|
| 开屏 | 樱花飘落中浮着一封信，轻触后火漆封蜡绽开、翻盖打开、信纸抽出，镜头推进 |
| 壹 · 缘起 | 1.jpg 聊天长截图自动缓缓上移（点一下看大图），配「像天外来物一样…」等文案 |
| 贰 · 心之所向 | 12 张 TA 喜欢的插画电影式轮播（缩略图可点选、可看大图） |
| 叁 · 回响 | 2.jpg + 「这里现在再看到还是会偷笑啊…」 |
| 肆 · 许愿 | 蛋糕与蜡烛，点一根亮一根；全亮后弹出小信封写下愿望 → 纸飞机带着愿望飞出 |
| 伍 · 予你 | 背景铺满 TA 喜欢的图（马赛克流动 + 拍立得相框），前景祝福与结尾语，彩带落下 |

操作：右上角 ♪ 播放/暂停、⇄ 切歌；右侧圆点或底部 ‹ › 切幕；键盘 ← → 空格；手机可左右滑动。

## 二、部署到 GitHub Pages

```bash
cd 生日祝福网站/site          # 本目录就是仓库根目录
git init
git add .
git commit -m "生日祝福网站"
git branch -M main
git remote add origin https://github.com/<你的用户名>/for-ouheimi.git
git push -u origin main
```

然后二选一：

**A. 最简单（分支部署）** — 仓库 Settings → Pages → Source 选 `Deploy from a branch`，
Branch 选 `main` + `/ (root)`，保存。等 1 分钟，访问 `https://<你的用户名>.github.io/for-ouheimi/`

**B. 用工作流** — 仓库 Settings → Pages → Source 选 `GitHub Actions`，
仓库里已带 `.github/workflows/pages.yml`，push 后自动发布。

> 建议仓库名用英文（`for-ouheimi`），首页会是 `index.html`，一切相对路径都正常。
> 若放到子目录部署（如 `https://xxx.github.io/birthday/ouheimi/`），把 `index.html` 里的
> `assets/cover.jpg` 换成完整网址即可（OG 图需要绝对路径）。

## 三、愿望回传（TA 写下的愿望怎么悄悄到你手里）

**TA 那边完全无感**：许愿后页面上不会出现任何「发邮件」「复制」「已发送」之类的按钮或字眼，
愿望在后台直接送出（演出里只有一句「你的愿望，已经随着纸飞机飞走了」）。

**你怎么收到 —— 三个途径，同时生效：**

1. **收件箱页（最直接）**：打开 <https://xiex16070-jpg.github.io/ouheimi-birthday/inbox-9f3k2q.html>
   （本地就是 `site/inbox-9f3k2q.html`）。页面会列出云端收到的每条愿望，还有「通道自检」按钮。
   > 这个页面没有任何地方链接它，只有你知道地址。云端默认通道 ntfy 只保留 **12 小时**，所以别拖太久。
2. **手机推送（推荐，能长期留存）**：手机装 [ntfy](https://ntfy.sh/) App → 订阅主题
   `wish-ea0728407aae42b46894be3d` → 以后 TA 一许愿，你手机立刻响，消息永久留在手机上。
3. **换成更稳的通道（推荐至少配一个）**：在 `js/app.js` 顶部的 `CFG.wish` 里填任意一个，填上就自动启用，
   多个通道会同时发送，**任一成功即算送达**：
   | 字段 | 填什么 | 效果 |
   |---|---|---|
   | `feishu` | 飞书群「自定义机器人」webhook | 国内最稳，手机秒推 |
   | `serverchan` | `https://sctapi.ftqq.com/你的SendKey.send` | 推到微信 |
   | `pushplus` | pushplus 的 token | 推到微信 |
   | `emailKey` | web3forms.com 给的 access_key（收件邮箱 2103886050@qq.com） | 直接进邮箱 |
   | `endpoint` | 你自己的接口（Cloudflare Worker / 云函数） | 收到 `{wish, at, from}` 的 POST |

**兜底**：愿望同时被写进地址栏 `你的网址/#wish=xxxx`，TA 只要把那个网址发你，你打开就能看到原文。

**送不出去怎么办**：任何一个通道失败都不会影响演出；这条愿望会排队，**TA 下次打开网页时自动补发**。

**关于隐私（要清楚）**：仓库是公开的，主题名/接口地址写在公开的 `js/app.js` 里，
所以「读了源码的人」理论上能订阅这个 ntfy 主题（只能看到愿望，看不到你的密码）。
想彻底避免这一点，就配一个推送通道（飞书/Server酱/邮箱这类链接即使被人看到，对方也只能发垃圾消息，读不到历史）。
配好后可以把 `ntfy` 那行删掉或留作备用。

> 不要再用 `formsubmit.co`：实测服务端返回 500，已确认不可用。
> 老的「愿望胶囊上有发邮件/复制按钮」的做法已删除，`provider`/`key` 字段也不再使用。

## 四、改东西

- 文案：直接改 `index.html`（`data-split` 属性会自动逐字入场）
- 蜡烛数量 / 插画停留时长 / 樱花密度 / 曲目：`js/app.js` 顶部 `CFG`
- 换图：替换 `assets/img/g01.jpg…g12.jpg`（同名 `t01…t12.jpg` 是缩略图），再跑一次 `重建图片资源.py`
- 换歌：替换 `assets/audio/bgm1.mp3`、`bgm2.mp3`
- 想回暗色：改 `css/style.css` 顶部的 `:root` 变量即可（`--ink` 系是文字、`--bg-*` 是底色、`--rose/--gold` 是点缀）

## 五、目录

```
index.html            页面结构（演出）
inbox-9f3k2q.html     愿望收件箱（只有你知道这个地址，没有页面链接它）
css/style.css         全部样式与动画
js/app.js             演出脚本 + 愿望回传（顶部 CFG.wish 配置所有通道）
assets/img/           图片（已压缩）
assets/audio/         两首背景音乐
assets/fonts/         霞鹜文楷子集（含 3755 常用字，约 860KB）
assets/cover.jpg      分享到微信/QQ 时的预览图
启动网站.bat           本地起服务器并打开（本地预览用）
重建图片资源.py         改过图片/音乐后重新生成 assets
预览-*.png            三张效果截图（可删）
.github/workflows/    GitHub Pages 自动发布
```

字体：[霞鹜文楷 LXGW WenKai](https://github.com/lxgw/LxgwWenKai)（SIL OFL 1.1，可自由使用与再分发）。
