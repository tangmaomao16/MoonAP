# MoonAP

MoonAP 是一个面向 MoonBit 大型软件合成场景的原型网页：

- 用户用自然语言描述需求
- 系统生成 MoonBit 程序
- 服务端调用 `moon build cmd/main --target wasm`
- 浏览器加载 Wasm 并执行程序

## 快速启动

1. 在项目根目录运行 `npm run dev`
2. 打开 `http://localhost:3000`
3. 输入自然语言需求，查看生成的 MoonBit 代码和浏览器执行结果

## 切换到真实大模型

默认使用本地规则生成器，方便在没有 API Key 的情况下跑通整条链路。

如果要接入兼容 OpenAI Chat Completions 的模型服务，设置这些环境变量：

- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

例如：

```powershell
$env:OPENAI_BASE_URL="https://your-endpoint/v1"
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-4.1-mini"
npm run dev
```

## 当前原型范围

- 已实现聊天式界面
- 已实现 MoonBit 代码生成适配层
- 已实现 MoonBit 到 Wasm 的自动编译
- 已实现浏览器中的 Wasm 运行与输出采集

下一步适合继续扩展：

- 对话上下文长期记忆
- 代码解释与差异对比
- 多文件 MoonBit 工程生成
- 安全沙箱和资源配额控制
