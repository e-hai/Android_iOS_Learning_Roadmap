import SwiftUI

@main
struct LearningCockpitApp: App {
    @State private var progressStore = ProgressStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(progressStore)
                .tint(AppTheme.accent)
        }
        .defaultSize(width: 1180, height: 760)
    }
}
