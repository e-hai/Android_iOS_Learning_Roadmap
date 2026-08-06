import SwiftUI

/// 驾驶舱根界面：侧栏路线 + 详情；依赖 Environment 的 VM 在首次出现时创建。
struct ContentView: View {
    @Environment(AppViewModel.self) private var app
    @Environment(\.openWindow) private var openWindow
    @Environment(\.dismissWindow) private var dismissWindow

    @State private var viewModel: CockpitViewModel?

    var body: some View {
        Group {
            if let viewModel {
                cockpitBody(viewModel)
            } else {
                // @Environment 在属性初始化时不可用，故延后创建 ViewModel
                Color.clear
                    .onAppear {
                        viewModel = CockpitViewModel(app: app)
                    }
            }
        }
    }

    @ViewBuilder
    private func cockpitBody(_ viewModel: CockpitViewModel) -> some View {
        NavigationSplitView {
            SidebarView(selection: Bindable(viewModel).selection)
                .navigationSplitViewColumnWidth(min: 200, ideal: 240, max: 320)
        } detail: {
            Group {
                switch viewModel.selection {
                case .home, .none:
                    HomeView(selection: Bindable(viewModel).selection)
                case .stage(let id):
                    if let stage = app.roadmap.stage(id: id) {
                        StageDetailView(stage: stage)
                            .transition(.asymmetric(
                                insertion: .opacity.combined(with: .move(edge: .trailing)),
                                removal: .opacity
                            ))
                    } else {
                        ContentUnavailableView(L10n.tr("content.missing"), systemImage: "questionmark.folder")
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .animation(.easeInOut(duration: 0.22), value: viewModel.selection)
        }
        // 侧栏收起时详情优先占满剩余空间
        .navigationSplitViewStyle(.prominentDetail)
        .tint(AppTheme.accent)
        .onAppear {
            dismissWindow(id: WindowID.card)
        }
        .onReceive(NotificationCenter.default.publisher(for: .openLearningCard)) { _ in
            route(viewModel.openLearningCard())
        }
        .onReceive(NotificationCenter.default.publisher(for: .openCockpit)) { _ in
            route(viewModel.openCockpit())
        }
    }

    private func route(_ intent: CockpitViewModel.WindowIntent) {
        StudyWindowRouter.route(
            intent,
            openWindow: openWindow,
            dismissWindow: dismissWindow
        )
    }
}

#Preview {
    ContentView()
        .environment(AppViewModel())
}
