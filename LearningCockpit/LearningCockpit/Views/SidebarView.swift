import SwiftUI

/// 驾驶舱侧栏：进度徽章 + 主线 / 进阶阶段列表。
struct SidebarView: View {
    @Environment(AppViewModel.self) private var app
    @Binding var selection: SidebarSelection?

    var body: some View {
        List(selection: $selection) {
            Section {
                ProgressBadge(
                    completed: app.progress.mainPathCompletedCount(from: app.roadmap.stages),
                    total: app.progress.mainPathTotal(from: app.roadmap.stages)
                )
                .padding(.vertical, 4)
                .listRowInsets(EdgeInsets(top: 10, leading: 12, bottom: 10, trailing: 12))
                .listRowBackground(AppTheme.accentSoft.opacity(0.55))
            }

            Section {
                Label {
                    Text(L10n.tr("sidebar.start"))
                        .font(AppTheme.body(13, weight: .semibold))
                } icon: {
                    Image(systemName: "house.fill")
                        .foregroundStyle(AppTheme.accent)
                }
                .tag(SidebarSelection.home)
            }

            Section {
                ForEach(app.roadmap.mainPathStages) { stage in
                    stageRow(stage)
                }
            } header: {
                Text(L10n.tr("sidebar.main"))
                    .font(AppTheme.label(10))
                    .foregroundStyle(AppTheme.accent)
                    .textCase(nil)
            }

            Section {
                ForEach(app.roadmap.advancedStages) { stage in
                    stageRow(stage)
                }
            } header: {
                Text(L10n.tr("sidebar.advanced"))
                    .font(AppTheme.label(10))
                    .foregroundStyle(AppTheme.warn)
                    .textCase(nil)
            }
        }
        .listStyle(.sidebar)
        .navigationTitle(L10n.tr("sidebar.cockpit"))
    }

    @ViewBuilder
    private func stageRow(_ stage: LearningStage) -> some View {
        let done = app.progress.isStageFullyComplete(stage.id)
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .strokeBorder(done ? AppTheme.done : AppTheme.hairline, lineWidth: 1.5)
                    .frame(width: 16, height: 16)
                if done {
                    Image(systemName: "checkmark")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundStyle(AppTheme.done)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .animation(.spring(response: 0.35, dampingFraction: 0.7), value: done)

            VStack(alignment: .leading, spacing: 2) {
                Text("\(stage.number). \(stage.title)")
                    .font(AppTheme.body(12.5, weight: .medium))
                    .foregroundStyle(AppTheme.ink)
                    .lineLimit(1)
                Text(stage.stars)
                    .font(AppTheme.label(9, weight: .medium))
                    .foregroundStyle(AppTheme.inkMuted)
            }
        }
        .padding(.vertical, 1)
        .tag(SidebarSelection.stage(stage.id))
    }
}
