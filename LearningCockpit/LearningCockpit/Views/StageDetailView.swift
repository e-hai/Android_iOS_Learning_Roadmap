import SwiftUI

/// 驾驶舱阶段详情：进度勾选与完整学习内容。
struct StageDetailView: View {
    let stage: LearningStage
    @Environment(AppViewModel.self) private var app
    @State private var appeared = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                header
                progressToggles
                goalSection
                if !stage.notes.isEmpty {
                    notesSection
                }
                comparisonSection
                if let hint = stage.extraHint {
                    hintSection(hint)
                }
                practiceSection
            }
            .padding(32)
            .frame(maxWidth: 920, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .leading)
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AtmosphereBackground())
        .navigationTitle(stage.displayTitle)
        .id(stage.id)
        .onAppear {
            appeared = false
            withAnimation(.easeOut(duration: 0.35)) {
                appeared = true
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                PlatformChip(kind: stage.isAdvanced ? .advanced : .path)
                Text(stage.stars)
                    .font(AppTheme.label(11, weight: .medium))
                    .foregroundStyle(AppTheme.inkMuted)
                Spacer()
                Text(String(format: "%02d", stage.number))
                    .font(AppTheme.display(28, weight: .bold))
                    .foregroundStyle(AppTheme.accent.opacity(0.22))
            }

            Text(stage.title)
                .font(AppTheme.display(30))
                .foregroundStyle(AppTheme.ink)
        }
    }

    private var progressToggles: some View {
        HStack(spacing: 24) {
            Toggle(isOn: Binding(
                get: { app.progress.isReadComplete(stage.id) },
                set: { app.progress.setReadComplete(stage.id, $0) }
            )) {
                Text(L10n.tr("detail.read"))
                    .font(AppTheme.body(13, weight: .medium))
            }
            Toggle(isOn: Binding(
                get: { app.progress.isPracticeComplete(stage.id) },
                set: { app.progress.setPracticeComplete(stage.id, $0) }
            )) {
                Text(L10n.tr("detail.practice"))
                    .font(AppTheme.body(13, weight: .medium))
            }
            Spacer()
        }
        .toggleStyle(.checkbox)
        .padding(14)
        .background(AppTheme.surfaceRaised.opacity(0.65))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .strokeBorder(AppTheme.hairline, lineWidth: 1)
        )
    }

    private var goalSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: L10n.tr("detail.section.goal"))
            Text(stage.goal)
                .font(AppTheme.body(14.5))
                .foregroundStyle(AppTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
                .lineSpacing(3)
        }
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: L10n.tr("detail.section.notes"), accent: AppTheme.warn)
            VStack(alignment: .leading, spacing: 8) {
                ForEach(stage.notes, id: \.self) { note in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(AppTheme.warn)
                            .padding(.top, 3)
                        Text(note)
                            .font(AppTheme.body(13.5))
                            .foregroundStyle(AppTheme.ink)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineSpacing(2)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.warnSoft)
                    .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                }
            }
        }
    }

    private var comparisonSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: L10n.tr("detail.section.compare"))
            ComparisonTableView(rows: stage.rows)
        }
    }

    private func hintSection(_ hint: String) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: L10n.tr("detail.section.structure"), accent: AppTheme.iosTint)
            Text(hint)
                .font(AppTheme.mono(12))
                .foregroundStyle(AppTheme.ink)
                .textSelection(.enabled)
                .lineSpacing(4)
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppTheme.iosSoft)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .strokeBorder(AppTheme.iosTint.opacity(0.18), lineWidth: 1)
                )
        }
    }

    private var practiceSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: L10n.tr("detail.section.practice"), accent: AppTheme.androidTint)
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "hammer.fill")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(AppTheme.androidTint)
                    .padding(.top, 2)
                Text(stage.practice)
                    .font(AppTheme.body(14))
                    .foregroundStyle(AppTheme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineSpacing(3)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(
                    colors: [AppTheme.androidSoft, AppTheme.accentSoft],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .strokeBorder(AppTheme.androidTint.opacity(0.2), lineWidth: 1)
            )
        }
    }
}
