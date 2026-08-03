# 学习驾驶舱（LearningCockpit）

macOS / SwiftUI 应用：把 Android → iOS 学习路线拆成可点选阶段、对照表、练手与本地进度。

## 要求

- macOS 14+
- Xcode 15+（建议最新稳定版）

## 运行

1. 打开工程：

```bash
open LearningCockpit.xcodeproj
```

或在 Finder 中双击 `LearningCockpit.xcodeproj`。

2. 在 Xcode 顶部方案选择 **LearningCockpit**，目标选 **My Mac**。
3. 按 `⌘R`（Product → Run）启动。

## 功能

- **首页**：用法说明、迁移者速查、实践节奏、开始学习
- **主路径 ①–⑩ / 进阶 ⑪–⑯**：侧栏导航
- **阶段详情**：目标、迁移注意、Android↔iOS 对照、练手
- **进度**：勾选「已读完」「练手已完成」，写入 `UserDefaults`，重启后保留

## 内容来源

阶段数据在 `LearningCockpit/Data/RoadmapData.swift`，由仓库根目录的 `Android_vs_iOS_Learning_Roadmap.md` 提炼。改内容时编辑该 Swift 文件即可。

## 工程结构

```
LearningCockpit/
├── LearningCockpitApp.swift
├── ContentView.swift
├── Models/
├── Data/RoadmapData.swift
├── Views/
└── Assets.xcassets
```
