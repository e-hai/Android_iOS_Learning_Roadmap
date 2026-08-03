import SwiftUI

struct ContentView: View {
    @Environment(ProgressStore.self) private var progressStore
    @State private var selection: SidebarSelection? = .home

    var body: some View {
        NavigationSplitView {
            SidebarView(selection: $selection)
        } detail: {
            Group {
                switch selection {
                case .home, .none:
                    HomeView(selection: $selection)
                case .stage(let id):
                    if let stage = RoadmapData.stage(id: id) {
                        StageDetailView(stage: stage)
                            .transition(.asymmetric(
                                insertion: .opacity.combined(with: .move(edge: .trailing)),
                                removal: .opacity
                            ))
                    } else {
                        ContentUnavailableView("未找到阶段", systemImage: "questionmark.folder")
                    }
                }
            }
            .animation(.easeInOut(duration: 0.22), value: selection)
        }
        .navigationSplitViewStyle(.balanced)
        .tint(AppTheme.accent)
    }
}

#Preview {
    ContentView()
        .environment(ProgressStore())
}
