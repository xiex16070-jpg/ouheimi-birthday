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

## 愿望回传（TA 写下的愿望怎么给你，收件邮箱已设为 2103886050@qq.com）

**开箱即用（无需任何配置）**：TA 许愿后，第五幕的愿望胶囊上有两个按钮
- **「发邮件给我」**：点一下，TA 的邮件客户端会带着愿望正文直接打开，TA 按发送即到你的 QQ 邮箱
- **「复制」**：复制愿望原文，TA 随手发你

**另外两条路**：
- **愿望链接**：TA 许愿后地址会变成 `你的网址/#wish=xxxx`，TA 把这个链接发你，你打开就能看到愿望
- **全自动发信（可选，2 分钟）**：去 <https://web3forms.com> 输入 2103886050@qq.com → 复制给你的 access_key → 填进 `js/app.js` 顶部：
  ```js
  wish: { provider: 'web3forms', email: '2103886050@qq.com', key: 'paste-your-key', endpoint: '' }
  ```
  之后 TA 一提交，愿望就自动寄到你邮箱，不用 TA 再点任何东西。
  （`formsubmit.co`、`formspree`、你自己的后端接口也都支持，见 `js/app.js` 里的注释；formsubmit 目前服务端返回 500，暂不可用。）

## 四、改东西

- 文案：直接改 `index.html`（`data-split` 属性会自动逐字入场）
- 蜡烛数量 / 插画停留时长 / 樱花密度 / 曲目：`js/app.js` 顶部 `CFG`
- 换图：替换 `assets/img/g01.jpg…g12.jpg`（同名 `t01…t12.jpg` 是缩略图），再跑一次 `重建图片资源.py`
- 换歌：替换 `assets/audio/bgm1.mp3`、`bgm2.mp3`
- 想回暗色：改 `css/style.css` 顶部的 `:root` 变量即可（`--ink` 系是文字、`--bg-*` 是底色、`--rose/--gold` 是点缀）

## 五、目录

```
index.html            页面结构
css/style.css         全部样式与动画
js/app.js             演出脚本 + 愿望回传
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
