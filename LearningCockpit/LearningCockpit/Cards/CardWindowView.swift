import SwiftUI

/// 学习卡窗口壳：出现时关闭驾驶舱，内容由 `LearningCardView` 渲染。
struct CardWindowView: View {
    @Environment(AppViewModel.self) private var app
    @Environment(\.dismissWindow) private var dismissWindow

    @State private var viewModel: CardWindowViewModel?

    var body: some View {
        ZStack {
            AppTheme.surfaceRaised
                .ignoresSafeArea()

            CardPanelConfigurator()
                .frame(width: 0, height: 0)

            Group {
                if let viewModel, let stage = viewModel.currentStage {
                    LearningCardView(stage: stage)
                        .id(stage.id)
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .move(edge: .trailing)),
                            removal: .opacity
                        ))
                } else if viewModel != nil {
                    Text(L10n.tr("card.empty"))
                        .font(AppTheme.body(14))
                        .foregroundStyle(AppTheme.inkMuted)
                } else {
                    Color.clear
                        .onAppear {
                            viewModel = CardWindowViewModel(app: app)
                        }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(minWidth: 480, idealWidth: 520, maxWidth: 640)
        .frame(minHeight: 640, idealHeight: 780, maxHeight: 900)
        .onAppear {
            dismissWindow(id: WindowID.cockpit)
            viewModel?.onAppear()
        }
        .onReceive(NotificationCenter.default.publisher(for: .openLearningCard)) { _ in
            viewModel?.handleOpenCardNotification()
        }
        .animation(.easeInOut(duration: 0.25), value: viewModel?.currentStageID)
    }
}
