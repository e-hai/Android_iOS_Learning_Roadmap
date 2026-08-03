import Foundation
import Observation

@Observable
final class ProgressStore {
    private let readKey = "completedStageIDs"
    private let practiceKey = "practicedStageIDs"

    private(set) var completedStageIDs: Set<String>
    private(set) var practicedStageIDs: Set<String>

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        completedStageIDs = Set(defaults.stringArray(forKey: readKey) ?? [])
        practicedStageIDs = Set(defaults.stringArray(forKey: practiceKey) ?? [])
    }

    private let defaults: UserDefaults

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

    private func mutate(_ set: inout Set<String>, id: String, value: Bool, key: String) {
        if value {
            set.insert(id)
        } else {
            set.remove(id)
        }
        defaults.set(Array(set).sorted(), forKey: key)
    }
}
