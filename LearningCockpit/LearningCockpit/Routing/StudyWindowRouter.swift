import SwiftUI

/// 学习卡与驾驶舱窗口互斥：打开一方前先关闭另一方。
enum StudyWindowRouter {
    static func openCard(
        openWindow: OpenWindowAction,
        dismissWindow: DismissWindowAction
    ) {
        dismissWindow(id: WindowID.cockpit)
        openWindow(id: WindowID.card)
    }

    static func openCockpit(
        openWindow: OpenWindowAction,
        dismissWindow: DismissWindowAction
    ) {
        dismissWindow(id: WindowID.card)
        openWindow(id: WindowID.cockpit)
    }

    static func route(
        _ intent: CardOrCockpitIntent,
        openWindow: OpenWindowAction,
        dismissWindow: DismissWindowAction
    ) {
        switch intent {
        case .card:
            openCard(openWindow: openWindow, dismissWindow: dismissWindow)
        case .cockpit:
            openCockpit(openWindow: openWindow, dismissWindow: dismissWindow)
        }
    }
}

/// 学习卡 / 驾驶舱开窗意图（由窗口 ViewModel 返回，View 负责路由）。
enum CardOrCockpitIntent: Equatable {
    case card
    case cockpit
}
