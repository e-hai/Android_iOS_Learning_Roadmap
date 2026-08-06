# AGENTS.md — LearningCockpit

本文件约束在本仓库中协作的 AI / Agent。改代码前先读 [README.md](./README.md) 与本文件。

## 项目身份

- **平台**：macOS 14+，SwiftUI + Observation（`@Observable`）
- **形态**：多窗口桌面应用（宠物 / 学习卡 / 驾驶舱），不是 iOS / 单页 App
- **目标**：Android 开发者学 iOS 的陪伴式路线工具；宠物是入口，不是游戏主玩法

## 架构铁律

1. **分层**：`View → 窗口 ViewModel → AppViewModel → Data(Repository)`。禁止 View 直连 `UserDefaults`、`RoadmapData` 或 Repository 实现类。
2. **唯一 Environment 入口**：只注入 `AppViewModel`。不要再单独 `.environment(ProgressStore)` / Repository。
3. **窗口 VM**（`DesktopPetViewModel` / `LearningCardViewModel` / `CardWindowViewModel` / `CockpitViewModel`）只接收 `AppViewModel`，不各自持有 Repository。
4. **Models** 只放纯实体与值类型；持久化与内容读取放 **Data**。
5. **`PetScene` 是 SpriteKit 动画引擎**（整图序列帧），不是 ViewModel。
6. **学习卡与驾驶舱互斥**：开窗走 `StudyWindowRouter`（先 `dismissWindow` 再 `openWindow`）；窗口 `onAppear` 也要关掉另一方。

## 命名与职责

| 类型 | 职责 |
| --- | --- |
| `AppViewModel` | 跨窗口会话（当前阶段、侧栏选中、气泡、庆祝）+ `progress` / `roadmap` |
| `UserDefaultsProgressStore` | 进度持久化；由 AppViewModel 持有具体类型以支持 Observation |
| `LocalRoadmapRepository` | 路线内容门面；内部可读 `RoadmapData` |
| `StudyWindowRouter` | 窗口互斥路由，不属于 Model / Data |

不要把 `AppViewModel` 改名叫「MainViewModel」——它不是某个主界面的专属 VM。

## SwiftUI 注意

- `View` 是值类型，**没有** UIKit 式生命周期；`onAppear` / `.task` / `onChange` **可能重复调用**。初始化副作用必须幂等（如 `guard viewModel == nil`）。
- `@Environment` 在属性默认值阶段不可用；依赖 Environment 的 VM 可在 `onAppear` / `.task` 创建，并用 `@State` 挂住。
- `@State` 跟的是视图树身份，不是 struct 的反复构造。关窗再开会新建 VM；侧栏切换不应重建 `AppViewModel`。
- 菜单栏「编辑 / 显示 / 帮助」多为系统默认；业务菜单用 `.commands { CommandMenu(...) }`，作用于 App 菜单栏而非单个 Window。

## 文案与资源

- 用户可见字符串进 `Localizable.xcstrings`，代码只用 `L10n.tr("key")`（可带格式参数）。
- 不要硬编码中英文 UI 文案进 Swift（调试 / 资源名除外）。
- 宠物序列帧增减时，只要按 `CatLife_00` 命名递增即可（`PetScene` 动态扫目录）；大跳变优先补中间帧再调切镜逻辑。

## 改动范围

- **只改任务需要的文件**；不做无关重构、不顺手「清理」大片代码。
- 不新增 README / 文档，除非用户明确要求（本仓库已有 README + AGENTS 时，更新它们以匹配真实架构）。
- 不引入网络层、数据库、DI 框架，除非用户明确要求。
- 不写 exploit / 攻击性代码；本地工程漏洞修复除外。

## 工程文件

- 本工程 **不是** folder-synced：新增 / 移动 Swift 文件必须改 `LearningCockpit.xcodeproj/project.pbxproj`。
- 改完应用逻辑后，尽量用以下命令验证编译：

```bash
xcodebuild -project LearningCockpit.xcodeproj -scheme LearningCockpit -configuration Debug -destination 'platform=macOS' build
```

## 提交与 Git

- 仅在用户明确要求时 commit / push。
- 不改 git config；不用 `-i` 交互命令；不用 force push main/master。

## 产品与体验偏好

- 宠物默认是**陪伴**，不是催学：单击不弹学习卡；催学放在右键「提醒」等显式入口。
- 驾驶舱侧栏收起时，详情区应铺满剩余宽度（`prominentDetail` + 内容 `maxWidth/maxHeight: .infinity`）。
- UI 跟现有 `AppTheme`；不要套用无关的通用「AI 落地页」视觉套路。

## 做事前自检

- [ ] 数据是否只经 `AppViewModel.progress` / `app.roadmap`？
- [ ] 新窗口意图是否走 `StudyWindowRouter`？
- [ ] 新文案是否进 xcstrings？
- [ ] 新 Swift 文件是否已进 pbxproj？
- [ ] 是否误把引擎逻辑塞进 ViewModel？
