import Foundation
import Observation

/// 学习卡窗口壳 ViewModel：同步当前阶段，供内容卡绑定。
@Observable
@MainActor
final class CardWindowViewModel {
    private let app: AppViewModel

    init(app: AppViewModel) {
        self.app = app
    }

    var currentStage: LearningStage? { app.currentStage }
    var currentStageID: String { app.currentStageID }

    var isAllDone: Bool {
        guard let stage = app.currentStage else { return false }
        return app.nextIncompleteStage() == nil
            && app.progress.isStageFullyComplete(stage.id)
    }

    func onAppear() {
        app.syncToNextIncomplete()
    }

    /// 菜单再次打开学习卡时，重新对齐到未完成阶段。
    func handleOpenCardNotification() {
        app.syncToNextIncomplete()
    }
}
