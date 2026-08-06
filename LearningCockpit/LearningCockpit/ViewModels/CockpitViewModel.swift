import Foundation
import Observation

/// 驾驶舱窗口 ViewModel：侧栏选中与开窗意图。
@Observable
@MainActor
final class CockpitViewModel {
    typealias WindowIntent = CardOrCockpitIntent

    private let app: AppViewModel

    init(app: AppViewModel) {
        self.app = app
    }

    var selection: SidebarSelection? {
        get { app.cockpitSelection }
        set { app.cockpitSelection = newValue }
    }

    @discardableResult
    func openLearningCard() -> WindowIntent {
        app.syncToNextIncomplete()
        return .card
    }

    @discardableResult
    func openCockpit() -> WindowIntent {
        .cockpit
    }
}
