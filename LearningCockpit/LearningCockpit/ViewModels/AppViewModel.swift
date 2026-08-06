import Foundation
import Observation

/// App 级 ViewModel：跨窗口会话状态 + 数据层入口。
/// View / 窗口 VM 只通过本类型访问 `progress` 与 `roadmap`，不要单独注入 Repository。
@Observable
final class AppViewModel {
    /// 进度仓库（具体类型，便于 Observation 追踪变更）。
    let progress: UserDefaultsProgressStore
    /// 路线内容仓库。
    let roadmap: RoadmapRepository

    /// 学习卡当前展示的阶段 id。
    var currentStageID: String
    /// 驾驶舱侧栏选中项。
    var cockpitSelection: SidebarSelection? = .home
    /// 宠物头顶短时气泡文案；`nil` 表示隐藏。
    var petBubble: String?
    /// 主线完成后的庆祝态（影响宠物表情）。
    var mainPathCelebrated = false

    /// 启动时的软陪伴问候（非催学）。
    private static var companionGreets: [String] {
        [
            L10n.tr("pet.meow"),
            L10n.tr("pet.greet.here"),
            L10n.tr("pet.greet.purr"),
            L10n.tr("pet.greet.dots"),
        ]
    }

    /// 单击撸猫时的短反应文案。
    private static var petReacts: [String] {
        [
            L10n.tr("pet.meow"),
            L10n.tr("pet.react.rub"),
            L10n.tr("pet.greet.purr"),
            L10n.tr("pet.react.hmm"),
            L10n.tr("pet.react.heart"),
        ]
    }

    init(
        progress: UserDefaultsProgressStore = UserDefaultsProgressStore(),
        roadmap: RoadmapRepository = LocalRoadmapRepository()
    ) {
        self.progress = progress
        self.roadmap = roadmap
        currentStageID = roadmap.mainPathStages.first?.id ?? roadmap.stages.first?.id ?? "env"
    }

    var currentStage: LearningStage? {
        roadmap.stage(id: currentStageID)
    }

    /// 下一个未完成阶段：先主线，再进阶。
    func nextIncompleteStage() -> LearningStage? {
        if let main = roadmap.mainPathStages.first(where: { !progress.isStageFullyComplete($0.id) }) {
            return main
        }
        return roadmap.advancedStages.first(where: { !progress.isStageFullyComplete($0.id) })
    }

    /// 把当前卡定位到下一个未完成阶段；若已全部完成则停在最后一关并标记庆祝。
    func syncToNextIncomplete() {
        if let next = nextIncompleteStage() {
            currentStageID = next.id
            mainPathCelebrated = false
        } else if let last = roadmap.stages.last {
            currentStageID = last.id
            mainPathCelebrated = progress.mainPathCompletedCount(from: roadmap.stages)
                >= progress.mainPathTotal(from: roadmap.stages)
        }
    }

    /// 打开驾驶舱时聚焦到指定阶段。
    func focusStageInCockpit(_ stageID: String) {
        currentStageID = stageID
        cockpitSelection = .stage(stageID)
    }

    /// 显示气泡，到期后自动清除（若期间未被替换）。
    func showBubble(_ text: String, duration: TimeInterval = 2.4) {
        petBubble = text
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: UInt64(duration * 1_000_000_000))
            if petBubble == text {
                petBubble = nil
            }
        }
    }

    /// 启动问候气泡（陪伴向，不催学）。
    func greetBubble() {
        showBubble(Self.companionGreets.randomElement() ?? L10n.tr("pet.meow"), duration: 2.0)
    }

    /// 撸猫短反应气泡。
    func petReactBubble() {
        showBubble(Self.petReacts.randomElement() ?? L10n.tr("pet.meow"), duration: 1.6)
    }

    /// 右键「提醒下一步」：显式催学入口。
    func nudgeBubble() {
        if let next = nextIncompleteStage() {
            showBubble(L10n.tr("pet.nudge.stage", next.number), duration: 3.2)
        } else {
            showBubble(L10n.tr("pet.nudge.done"), duration: 3.0)
            mainPathCelebrated = true
        }
    }
}
