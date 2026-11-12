# pchat · 一处会随时间变暗的房间

一个简约的一对一视频聊天房。生成暗号开一间房，把暗号递给对方，对方凭暗号推门而入。两人视频相见、发消息、一起调灯光壁炉与天气；窗外的天色跟随真实时钟在清晨、白昼、黄昏、夜晚之间缓慢流转，也可以手动预览任一时段。

全程是点对点直连：音视频与文字都不经过应用服务器，消息不落盘、不写入 URL，关掉页面就散了。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。

- **开一间房**：点击「开一间房」，系统会生成一组易读暗号（例如 `MIST-7K2`），也可以自己写一个。复制暗号发给对方，然后留在页面等人来。
- **凭暗号赴约**：在另一台设备或另一个浏览器窗口输入同一暗号，点击进入。第一台设备会看到对方推门进来，视频自动接通。
- 两端都可以开关麦克风与摄像头、发文字与表情、调灯光亮度、点亮壁炉、切换窗外天气、预览时段、静音提示音。
- 点「离开」会先熄灯、合门，对方屏幕播放告别反馈，然后各自回到门前。

其他命令：

```bash
npm run build      # 生产构建
npm run start      # 运行生产构建
npm run typecheck  # TypeScript 检查
npm run lint       # ESLint
```

## 线上版本

线上地址：https://lyric-zemin.github.io/pchat/ 。GitHub Pages 自带 HTTPS，摄像头与麦克风可正常使用。

推送到 `master`，或在仓库 Actions 页手动运行 `Deploy to GitHub Pages`，都会自动构建并发布。首次发布前需在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

发布时 `.github/workflows/deploy.yml` 会注入 `STATIC_EXPORT=true` 与 `NEXT_PUBLIC_BASE_PATH=/pchat`，把站点静态导出到 `out/` 后上传；本地的 `npm run dev`、`npm run build`、`npm run start` 不受影响，仍使用默认的服务端构建。

## 暗号怎么用

暗号就是房门的钥匙。它被规范化（忽略大小写、空格、连字符、易混字符）后用 SHA-256 派生出房主的 Peer ID，所以**不需要房间目录服务器**：同样的暗号总会指向同一间房。

- 系统生成的暗号是 6 位随机字符，熵足够，不怕被猜到。
- 自定义暗号建议至少 6 位、混合字母数字；太短或全是重复字符会给出强度提示。
- 同一暗号同时只能存在一间房：第二个人用同一暗号「开房」会收到「暗号已被占用」。
- 房内最多两人，第三人加入会收到「房间里已经有两个人了」。
- 双方都离开后，房间自然消失。请不要把暗号当作长期公开的会议室链接。

## 四段天色

| 时段 | 本机时间 | 窗外 |
| --- | --- | --- |
| 清晨 | 05:00 – 08:00 | 蜜色薄雾，光从窗沿慢慢爬进来 |
| 白昼 | 08:00 – 17:00 | 通透的浅蓝，云影缓慢漂移 |
| 黄昏 | 17:00 – 20:00 | 橘红晚霞，暖光渐浓 |
| 夜晚 | 20:00 – 05:00 | 深蓝星火，灯与壁炉成为主光源 |

默认跟随本机时钟，每分钟检查一次、用 1.2 秒交叉淡入过渡，不会突然跳色。房间顶部与落地页底部的时段切换器可以手动预览任意时段，点「跟随时钟」恢复自动。房内由开房的一方担任时间权威并广播给对方，两端看到的永远是同一片天色。

## 关于摄像头权限

`getUserMedia` 只在 **HTTPS** 或 **localhost** 下可用。本机开发用 `localhost` 即可。

想在手机上和电脑联调（局域网 `http://192.168.x.x:3000`），浏览器会直接拒绝摄像头。可选做法：

```bash
# 1. 用 HTTPS 反向代理，或
# 2. 给 Chrome 加白名单：chrome://flags/#unsafely-treat-insecure-origin-as-secure
#    填入 http://192.168.x.x:3000 并重启浏览器
```

即使没有摄像头或拒绝授权也不会白屏：会退化成「仅观看」或「仅文字」，聊天、氛围与时段同步照常可用。

## 切换到自建 PeerServer

默认零配置，使用 PeerJS 官方公共信令服务（`0.peerjs.com`），只用于两端牵线，牵完线媒体走 P2P。若要完全自持，复制 `.env.example` 为 `.env.local`：

```dotenv
NEXT_PUBLIC_PEER_HOST=127.0.0.1
NEXT_PUBLIC_PEER_PORT=9000
NEXT_PUBLIC_PEER_PATH=/
NEXT_PUBLIC_PEER_SECURE=false
NEXT_PUBLIC_PEER_KEY=peerjs
```

本地起一个信令服务：

```bash
npx --yes peer --port 9000 --path / --key peerjs
```

注意包名要写 `peer`（服务端），它提供的命令恰好叫 `peerjs`；而 `peerjs` 本身是浏览器客户端库，没有可执行命令，写 `npx peerjs` 会报 `could not determine executable to run`。等价写法：`npx --yes --package=peer peerjs --port 9000 --path / --key peerjs`。

看到 `Started PeerServer on ::, port: 9000, path: /` 即启动成功；用 `curl http://127.0.0.1:9000/peerjs/id` 应返回一个随机 ID。

重启 `npm run dev` 后生效，业务代码无需改动。生产环境建议 HTTPS + `NEXT_PUBLIC_PEER_SECURE=true`。

## 常见问题

**输入暗号后一直「正在敲门」？** 对方还没开房、暗号打错了，或公共信令服务暂时不可达。10 秒后会给出明确提示。两端浏览器都需要能访问外网（使用官方云时）。

**视频黑屏但能发消息？** 多为摄像头被占用、驱动拒绝或权限被撤回。关掉摄像头再打开，或刷新页面重新授权。

**两个标签页能测试吗？** 可以，同一浏览器的两个标签页即可；若只有一个摄像头，第二个标签页可能拿不到设备，此时会自动降级为仅观看/仅文字，仍可验证消息、氛围、时段与进出反馈。加 `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` 启动 Chrome 可以模拟设备。

**消息会保存吗？** 不会。只在两端内存中，刷新即清空。

## 技术构成

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS · PeerJS（WebRTC 音视频 + DataConnection）· framer-motion（分镜动效）· zustand（房间状态机）· Web Audio（合成提示音，无音频素材）· CSS/SVG（程序化场景，无图片资源）。

所有场景、光效与音效都在本地生成，不依赖外部素材或后端服务。
