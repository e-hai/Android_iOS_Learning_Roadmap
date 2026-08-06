import Foundation

/// 本地静态路线仓库，内容来自 `RoadmapData`。
/// UI 应通过 `AppViewModel.roadmap` 访问，避免直接依赖 `RoadmapData`。
struct LocalRoadmapRepository: RoadmapRepository {
    var stages: [LearningStage] { RoadmapData.stages }
    var mainPathStages: [LearningStage] { RoadmapData.mainPathStages }
    var advancedStages: [LearningStage] { RoadmapData.advancedStages }
    var cheatSheet: [ComparisonRow] { RoadmapData.cheatSheet }
    var practiceWeeks: [String] { RoadmapData.practiceWeeks }

    func stage(id: String) -> LearningStage? {
        RoadmapData.stage(id: id)
    }
}
