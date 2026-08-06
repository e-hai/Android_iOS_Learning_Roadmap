import Foundation
import Observation

/// 学习卡内容 ViewModel：进度勾选与「下一阶段」。
@Observable
@MainActor
final class LearningCardViewModel {
    private(set) var stage: LearningStage
    private let app: AppViewModel

    init(stage: LearningStage, app: AppViewModel) {
        self.stage = stage
        self.app = app
    }

    /// 当前阶段已完成且没有未完成阶段。
    var isAllDone: Bool {
        app.nextIncompleteStage() == nil
            && app.progress.isStageFullyComplete(stage.id)
    }

    var isReadComplete: Bool {
        get { app.progress.isReadComplete(stage.id) }
        set { app.progress.setReadComplete(stage.id, newValue) }
    }

    var isPracticeComplete: Bool {
        get { app.progress.isPracticeComplete(stage.id) }
        set { app.progress.setPracticeComplete(stage.id, newValue) }
    }

    var nextButtonTitle: String {
        if app.nextIncompleteStage() == nil,
           app.progress.isStageFullyComplete(stage.id) {
            return L10n.tr("card.next.done")
        }
        return L10n.tr("card.next.stage")
    }

    var stageIndexLabel: String {
        "\(stage.number)/\(app.roadmap.stages.count)"
    }

    /// 窗口切换阶段时更新内容（同 id 则忽略）。
    func updateStageIfNeeded(_ stage: LearningStage) {
        guard self.stage.id != stage.id else { return }
        self.stage = stage
    }

    /// 优先跳到编号更大的未完成阶段，否则回到全局下一个未完成。
    func advance() {
        let laterIncomplete = app.roadmap.stages.first {
            $0.number > stage.number && !app.progress.isStageFullyComplete($0.id)
        }
        let next = laterIncomplete ?? app.nextIncompleteStage()

        guard let next, next.id != stage.id else {
            app.syncToNextIncomplete()
            if app.nextIncompleteStage() == nil {
                app.showBubble(L10n.tr("pet.bubble.all_done"))
                app.mainPathCelebrated = true
            }
            return
        }

        app.currentStageID = next.id
        app.showBubble(L10n.tr("pet.bubble.stage", next.number))
    }
}
