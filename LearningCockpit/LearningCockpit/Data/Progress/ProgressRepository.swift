import Foundation

/// 数据层：学习进度持久化契约。View / ViewModel 不应直接碰存储实现细节。
protocol ProgressRepository: AnyObject {
    /// 是否已勾选「读完」。
    func isReadComplete(_ stageID: String) -> Bool
    /// 是否已勾选「练完」。
    func isPracticeComplete(_ stageID: String) -> Bool
    /// 读完且练完。
    func isStageFullyComplete(_ stageID: String) -> Bool
    func setReadComplete(_ stageID: String, _ value: Bool)
    func setPracticeComplete(_ stageID: String, _ value: Bool)
    /// 主线已完成阶段数（不含进阶）。
    func mainPathCompletedCount(from stages: [LearningStage]) -> Int
    /// 主线阶段总数。
    func mainPathTotal(from stages: [LearningStage]) -> Int
}
