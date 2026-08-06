import Foundation

/// 数据层：学习路线 / 阶段内容读取契约。
protocol RoadmapRepository {
    /// 全部阶段（主线 + 进阶）。
    var stages: [LearningStage] { get }
    var mainPathStages: [LearningStage] { get }
    var advancedStages: [LearningStage] { get }
    /// 首页速查对照表。
    var cheatSheet: [ComparisonRow] { get }
    /// 建议练习节奏文案。
    var practiceWeeks: [String] { get }

    func stage(id: String) -> LearningStage?
}
