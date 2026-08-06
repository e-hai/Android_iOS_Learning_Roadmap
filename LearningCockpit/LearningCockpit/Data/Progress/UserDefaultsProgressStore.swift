import Foundation
import Observation

/// 基于 UserDefaults 的进度仓库。
/// 由 `AppViewModel` 持有具体类型，以便 Observation 能追踪属性变化并刷新 UI。
@Observable
final class UserDefaultsProgressStore: ProgressRepository {
    private let readKey = "completedStageIDs"
    private let practiceKey = "practicedStageIDs"

    /// 已读完的阶段 id。
    private(set) var completedStageIDs: Set<String>
    /// 已练完的阶段 id。
    private(set) var practicedStageIDs: Set<String>

    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        completedStageIDs = Set(defaults.stringArray(forKey: readKey) ?? [])
        practicedStageIDs = Set(defaults.stringArray(forKey: practiceKey) ?? [])
    }

    func isReadComplete(_ stageID: String) -> Bool {
        completedStageIDs.contains(stageID)
    }

    func isPracticeComplete(_ stageID: String) -> Bool {
        practicedStageIDs.contains(stageID)
    }

    func isStageFullyComplete(_ stageID: String) -> Bool {
        isReadComplete(stageID) && isPracticeComplete(stageID)
    }

    func setReadComplete(_ stageID: String, _ value: Bool) {
        mutate(&completedStageIDs, id: stageID, value: value, key: readKey)
    }

    func setPracticeComplete(_ stageID: String, _ value: Bool) {
        mutate(&practicedStageIDs, id: stageID, value: value, key: practiceKey)
    }

    func mainPathCompletedCount(from stages: [LearningStage]) -> Int {
        stages.filter { !$0.isAdvanced && isStageFullyComplete($0.id) }.count
    }

    func mainPathTotal(from stages: [LearningStage]) -> Int {
        stages.filter { !$0.isAdvanced }.count
    }

    /// 更新内存集合并同步写入 UserDefaults。
    private func mutate(_ set: inout Set<String>, id: String, value: Bool, key: String) {
        if value {
            set.insert(id)
        } else {
            set.remove(id)
        }
        defaults.set(Array(set).sorted(), forKey: key)
    }
}
