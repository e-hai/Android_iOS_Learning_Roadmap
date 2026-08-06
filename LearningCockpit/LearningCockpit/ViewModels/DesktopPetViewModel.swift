import Foundation
import Observation

/// 桌面宠物窗口 ViewModel：表情、手势反馈、开窗意图。
@Observable
@MainActor
final class DesktopPetViewModel {
    typealias WindowIntent = CardOrCockpitIntent

    /// 当前宠物动画状态。
    var mood: PetMood = .idle

    private let app: AppViewModel
    /// 避免 `onAppear` 重复触发启动问候。
    private var didConfigure = false

    init(app: AppViewModel) {
        self.app = app
    }

    var bubbleText: String? { app.petBubble }
    var isCelebrated: Bool { app.mainPathCelebrated }

    func onAppear() {
        app.syncToNextIncomplete()
        if app.mainPathCelebrated {
            mood = .happy
        }
        guard !didConfigure else { return }
        didConfigure = true
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 700_000_000)
            app.greetBubble()
        }
    }

    /// 单击：撸猫反应（不开学习卡）。
    func petReact() {
        mood = .petting
        app.petReactBubble()
    }

    /// 右键：提醒下一步。
    func nudge() {
        app.nudgeBubble()
    }

    func handleCelebrationChange(_ celebrated: Bool) {
        if celebrated && (mood == .idle || mood == .sleepy) {
            mood = .happy
        }
    }

    /// 双击 / 菜单：打开学习卡。
    @discardableResult
    func openLearningCard() -> WindowIntent {
        mood = app.mainPathCelebrated ? .happy : .idle
        app.syncToNextIncomplete()
        app.showBubble(L10n.tr("pet.meow"), duration: 1.4)
        return .card
    }

    /// 菜单：打开驾驶舱并尽量聚焦当前阶段。
    @discardableResult
    func openCockpit() -> WindowIntent {
        if let stage = app.currentStage {
            app.focusStageInCockpit(stage.id)
        } else {
            app.cockpitSelection = .home
        }
        return .cockpit
    }
}
