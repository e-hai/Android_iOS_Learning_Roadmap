import SwiftUI

/// 应用入口：三个独立 Window（宠物 / 学习卡 / 驾驶舱），共享一个 `AppViewModel`。
@main
struct LearningCockpitApp: App {
    @State private var appViewModel = AppViewModel()

    var body: some Scene {
        // 主入口：桌面宠物（透明置顶）
        Window(L10n.tr("window.pet"), id: WindowID.pet) {
            DesktopPetView()
                .environment(appViewModel)
                .tint(AppTheme.accent)
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
        .defaultSize(width: 140, height: 140)
        .defaultPosition(.bottomTrailing)

        // 递进学习卡
        Window(L10n.tr("window.card"), id: WindowID.card) {
            CardWindowView()
                .environment(appViewModel)
                .tint(AppTheme.accent)
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
        .defaultSize(width: 520, height: 780)
        .defaultPosition(.center)

        // 二级驾驶舱（侧栏 + 详情）
        Window(L10n.tr("window.cockpit"), id: WindowID.cockpit) {
            ContentView()
                .environment(appViewModel)
                .tint(AppTheme.accent)
        }
        .defaultSize(width: 1180, height: 760)
        .commands {
            // 业务菜单挂在 App 菜单栏（非单个窗口私有）
            CommandMenu(L10n.tr("menu.learning")) {
                Button(L10n.tr("menu.open_card")) {
                    appViewModel.syncToNextIncomplete()
                    openCardViaNotification()
                }
                .keyboardShortcut("l", modifiers: [.command])

                Button(L10n.tr("menu.open_cockpit")) {
                    openCockpitViaNotification()
                }
                .keyboardShortcut("d", modifiers: [.command])
            }
        }
    }

    /// 菜单命令拿不到 `openWindow` Environment，改用通知由已打开的窗口处理。
    private func openCardViaNotification() {
        NotificationCenter.default.post(name: .openLearningCard, object: nil)
    }

    private func openCockpitViaNotification() {
        NotificationCenter.default.post(name: .openCockpit, object: nil)
    }
}

extension Notification.Name {
    static let openLearningCard = Notification.Name("openLearningCard")
    static let openCockpit = Notification.Name("openCockpit")
}
