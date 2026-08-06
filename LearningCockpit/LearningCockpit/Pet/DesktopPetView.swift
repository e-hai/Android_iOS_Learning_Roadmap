import SwiftUI
import AppKit

/// 桌面宠物窗口：透明置顶入口，手势与右键菜单。
struct DesktopPetView: View {
    @Environment(AppViewModel.self) private var app
    @Environment(\.openWindow) private var openWindow
    @Environment(\.dismissWindow) private var dismissWindow

    @State private var viewModel: DesktopPetViewModel?

    var body: some View {
        Group {
            if let viewModel {
                petContent(viewModel)
            } else {
                Color.clear
                    .frame(width: 1, height: 1)
                    .onAppear {
                        viewModel = DesktopPetViewModel(app: app)
                    }
            }
        }
    }

    @ViewBuilder
    private func petContent(_ viewModel: DesktopPetViewModel) -> some View {
        ZStack(alignment: .top) {
            PetPanelConfigurator()
                .frame(width: 0, height: 0)

            PetCharacterView(celebrated: viewModel.isCelebrated, mood: Bindable(viewModel).mood)
                .contentShape(Rectangle())
                .gesture(
                    TapGesture(count: 2)
                        .onEnded { route(viewModel.openLearningCard()) }
                        .exclusively(before:
                            TapGesture(count: 1)
                                .onEnded { viewModel.petReact() }
                        )
                )
                .contextMenu {
                    Button(L10n.tr("menu.open_card")) {
                        route(viewModel.openLearningCard())
                    }
                    Button(L10n.tr("menu.open_cockpit")) {
                        route(viewModel.openCockpit())
                    }
                    Divider()
                    Button(L10n.tr("menu.nudge")) {
                        viewModel.nudge()
                    }
                    Divider()
                    Button(L10n.tr("menu.quit")) {
                        NSApp.terminate(nil)
                    }
                }
                .overlay(alignment: .top) {
                    if let bubble = viewModel.bubbleText {
                        Text(bubble)
                            .font(AppTheme.label(11, weight: .semibold))
                            .foregroundStyle(AppTheme.ink)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(AppTheme.surfaceRaised.opacity(0.96))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .strokeBorder(AppTheme.hairline, lineWidth: 1)
                            )
                            .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
                            .offset(y: -28)
                            .transition(.opacity.combined(with: .scale(scale: 0.96)))
                    }
                }
        }
        .fixedSize()
        .background(Color.clear)
        .compositingGroup()
        .onAppear { viewModel.onAppear() }
        .onChange(of: viewModel.isCelebrated) { _, celebrated in
            viewModel.handleCelebrationChange(celebrated)
        }
        .onReceive(NotificationCenter.default.publisher(for: .openLearningCard)) { _ in
            route(viewModel.openLearningCard())
        }
        .onReceive(NotificationCenter.default.publisher(for: .openCockpit)) { _ in
            route(viewModel.openCockpit())
        }
        .animation(.easeOut(duration: 0.2), value: viewModel.bubbleText)
    }

    /// 将 VM 意图交给互斥路由（学习卡 ↔ 驾驶舱）。
    private func route(_ intent: DesktopPetViewModel.WindowIntent) {
        StudyWindowRouter.route(
            intent,
            openWindow: openWindow,
            dismissWindow: dismissWindow
        )
    }
}
