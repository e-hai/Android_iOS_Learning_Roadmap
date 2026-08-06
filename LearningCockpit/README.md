# 学习驾驶舱（LearningCockpit）

macOS / SwiftUI 学习助手：以**像素橘猫桌面宠物**为入口，用递进**学习卡**走 Android → iOS 路线；需要查全表、侧栏导航时再打开二级**驾驶舱**。

## 功能概览

| 窗口 | 作用 |
| --- | --- |
| **学习伙伴（宠物）** | 透明置顶入口；陪伴动画、气泡；双击开学习卡 |
| **学习卡** | 当前阶段目标 / Android·iOS 对照 / 注意 / 练手；勾选进度、下一阶段 |
| **学习驾驶舱** | 侧栏路线 + 首页总览 + 阶段详情（深入查阅） |

学习卡与驾驶舱**互斥**：打开一方会关闭另一方；宠物窗可常驻。

## 环境要求

- macOS 14+
- Xcode 15+（建议最新稳定版）

## 运行

```bash
open LearningCockpit.xcodeproj
```

方案选 **LearningCockpit**，目标 **My Mac**，`⌘R`。启动后右下角出现可拖拽的像素橘猫。

命令行编译：

```bash
xcodebuild -project LearningCockpit.xcodeproj -scheme LearningCockpit -configuration Debug -destination 'platform=macOS' build
```

## 使用说明

### 宠物手势

SpriteKit 驱动同源多帧序列（`CatLife` / 眨眼 / 睡觉 / 撸猫）：帧已加密、待机乒乓循环、动作进出叠化衔接，显示宽约 96pt。

| 操作 | 效果 |
| --- | --- |
| **单击** | 撸猫反应 + 短气泡，**不**开卡 |
| **双击** | 打开当前阶段学习卡 |
| **右键** | 学习卡 / 驾驶舱 / 提醒下一步 / 退出 |
| 待机 | 眨眼、偶尔睡觉；主线完成后开心态 |

菜单「学习」：`⌘L` 学习卡，`⌘D` 驾驶舱。

### 进度

- 学习卡与驾驶舱共用本地进度（`UserDefaults`）
- 每阶段可勾选「读完」「练完」；主线全部完成后宠物庆祝

### 多语言

文案在 `LearningCockpit/Localizable.xcstrings`（简体中文 / English），代码用 `L10n.tr("key")`。应用显示名见 `InfoPlist.xcstrings`。

## 架构

```
View  ──► 窗口 ViewModel  ──►  AppViewModel  ──►  Data (Repository)
              │                     │
              │                     ├─ progress: UserDefaultsProgressStore
              │                     └─ roadmap: LocalRoadmapRepository
              └─ 只依赖 AppViewModel；不直连 Repository / UserDefaults
```

- **Models**：纯实体（`LearningStage`、`ComparisonRow`、`PetMood`、`WindowID`、`SidebarSelection`）
- **Data**：`ProgressRepository` / `RoadmapRepository` 及本地实现；静态内容在 `RoadmapData`
- **ViewModels**：`AppViewModel`（App 级会话 + 数据入口）+ 各窗口 VM
- **Views**：SwiftUI；宠物动画引擎是 `PetScene`（SpriteKit），**不是** ViewModel
- **Routing**：`StudyWindowRouter` 保证学习卡 ↔ 驾驶舱互斥

App 入口只注入一个 `.environment(appViewModel)`。

## 工程结构

```
LearningCockpit/
├── LearningCockpitApp.swift      # 三 Window Scene + 菜单命令
├── ContentView.swift             # 驾驶舱根 View
├── Models/                       # 纯实体
├── Data/
│   ├── Progress/                 # ProgressRepository + UserDefaultsProgressStore
│   └── Roadmap/                  # RoadmapRepository + Local + RoadmapData
├── ViewModels/                   # AppViewModel + Pet/Card/Cockpit VM
├── Routing/                      # StudyWindowRouter
├── Views/                        # 驾驶舱侧栏 / 首页 / 详情等
├── Cards/                        # 学习卡 UI
├── Pet/                          # 桌面宠物 + SpriteKit
├── Theme/                        # AppTheme
├── Localizable.xcstrings
└── Assets.xcassets
```

## 内容维护

阶段文案与对照表：`LearningCockpit/Data/Roadmap/RoadmapData.swift`（经 `LocalRoadmapRepository` 暴露）。  
新增阶段时同步更新 `Localizable.xcstrings` 对应 key。

## 给 AI / 协作者

约定见同目录 [AGENTS.md](./AGENTS.md)。
