import SwiftUI

/// 学习卡内容页：目标 / 对照 / 注意 / 练手 + 底栏进度。
struct LearningCardView: View {
    let stage: LearningStage

    @Environment(AppViewModel.self) private var app

    @State private var viewModel: LearningCardViewModel?

    var body: some View {
        Group {
            if let viewModel {
                cardBody(viewModel)
            } else {
                Color.clear
                    .onAppear {
                        viewModel = LearningCardViewModel(stage: stage, app: app)
                    }
            }
        }
        .onChange(of: stage.id) { _, _ in
            viewModel?.updateStageIfNeeded(stage)
        }
    }

    @ViewBuilder
    private func cardBody(_ viewModel: LearningCardViewModel) -> some View {
        VStack(spacing: 0) {
            // Top accent strip (depth without outer margin loss)
            LinearGradient(
                colors: [AppTheme.androidTint, AppTheme.accent],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(height: 3)

            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    headerLayer(viewModel)

                    if viewModel.isAllDone {
                        allDoneBanner
                    }

                    goalLayer
                    comparisonLayer

                    if !viewModel.stage.notes.isEmpty {
                        notesLayer(viewModel.stage)
                    }

                    if let hint = viewModel.stage.extraHint {
                        hintLayer(hint)
                    }

                    practiceLayer(viewModel.stage)
                }
                .padding(.horizontal, 12)
                .padding(.top, 10)
                .padding(.bottom, 8)
            }

            footerLayer(viewModel)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppTheme.surfaceRaised)
    }

    // MARK: - Header

    private func headerLayer(_ viewModel: LearningCardViewModel) -> some View {
        let stage = viewModel.stage
        return HStack(alignment: .center, spacing: 10) {
            Text(String(format: "%02d", stage.number))
                .font(AppTheme.mono(15, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 36, height: 36)
                .background(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [AppTheme.androidTint, AppTheme.accent],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                )

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    PlatformChip(kind: stage.isAdvanced ? .advanced : .path)
                    Text(stage.stars)
                        .font(AppTheme.label(9, weight: .medium))
                        .foregroundStyle(AppTheme.inkMuted)
                    Text("·")
                        .foregroundStyle(AppTheme.hairline)
                    Text(viewModel.stageIndexLabel)
                        .font(AppTheme.mono(10, weight: .medium))
                        .foregroundStyle(AppTheme.inkMuted)
                }
                Text(stage.title)
                    .font(AppTheme.display(18, weight: .bold))
                    .foregroundStyle(AppTheme.ink)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)
        }
        .padding(10)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .strokeBorder(AppTheme.hairline, lineWidth: 1)
        )
    }

    private var allDoneBanner: some View {
        Text(L10n.tr("card.done_hint"))
            .font(AppTheme.body(12))
            .foregroundStyle(AppTheme.done)
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.done.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    // MARK: - Goal

    private var goalLayer: some View {
        layeredSection(title: L10n.tr("card.section.goal"), accent: AppTheme.accent) {
            Text(stage.goal)
                .font(AppTheme.body(13.5))
                .foregroundStyle(AppTheme.ink)
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    // MARK: - Comparison

    private var comparisonLayer: some View {
        VStack(alignment: .leading, spacing: 6) {
            sectionLabel(L10n.tr("card.section.compare", stage.rows.count), color: AppTheme.iosTint)

            VStack(spacing: 5) {
                ForEach(stage.rows) { row in
                    comparisonRowPlate(row)
                }
            }
        }
    }

    private func comparisonRowPlate(_ row: ComparisonRow) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 6) {
                sidePlate(label: "AND", text: row.android, tint: AppTheme.androidTint, soft: AppTheme.androidSoft)
                Image(systemName: "arrow.right")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(AppTheme.inkMuted)
                    .frame(width: 12)
                    .padding(.top, 18)
                sidePlate(label: "iOS", text: row.ios, tint: AppTheme.iosTint, soft: AppTheme.iosSoft)
            }

            if let note = row.note, !note.isEmpty {
                Text(note)
                    .font(AppTheme.body(11))
                    .foregroundStyle(AppTheme.inkMuted)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.ink.opacity(0.03))
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .strokeBorder(AppTheme.hairline.opacity(0.85), lineWidth: 1)
        )
    }

    private func sidePlate(label: String, text: String, tint: Color, soft: Color) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(AppTheme.label(8, weight: .bold))
                .foregroundStyle(tint)
                .tracking(0.5)
            Text(text)
                .font(AppTheme.mono(11))
                .foregroundStyle(AppTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
                .textSelection(.enabled)
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(soft)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(tint)
                .frame(height: 2)
        }
    }

    // MARK: - Notes

    private func notesLayer(_ stage: LearningStage) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            sectionLabel(L10n.tr("card.section.notes"), color: AppTheme.warn)

            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(stage.notes.enumerated()), id: \.offset) { index, note in
                    HStack(alignment: .top, spacing: 8) {
                        Text(String(format: "%02d", index + 1))
                            .font(AppTheme.mono(9, weight: .bold))
                            .foregroundStyle(AppTheme.warn)
                            .frame(width: 20, height: 20)
                            .background(Color.white.opacity(0.55))
                            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))

                        Text(note)
                            .font(AppTheme.body(12.5))
                            .foregroundStyle(AppTheme.ink)
                            .lineSpacing(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)

                    if index < stage.notes.count - 1 {
                        Rectangle()
                            .fill(AppTheme.warn.opacity(0.12))
                            .frame(height: 1)
                            .padding(.leading, 38)
                    }
                }
            }
            .background(AppTheme.warnSoft.opacity(0.7))
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .strokeBorder(AppTheme.warn.opacity(0.2), lineWidth: 1)
            )
        }
    }

    // MARK: - Hint

    private func hintLayer(_ hint: String) -> some View {
        layeredSection(title: L10n.tr("card.section.structure"), accent: AppTheme.iosTint) {
            Text(hint)
                .font(AppTheme.mono(11))
                .foregroundStyle(AppTheme.ink)
                .lineSpacing(2)
                .textSelection(.enabled)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    // MARK: - Practice

    private func practiceLayer(_ stage: LearningStage) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            sectionLabel(L10n.tr("card.section.practice"), color: AppTheme.androidTint)

            HStack(alignment: .top, spacing: 10) {
                RoundedRectangle(cornerRadius: 2, style: .continuous)
                    .fill(AppTheme.androidTint)
                    .frame(width: 3)

                Text(stage.practice)
                    .font(AppTheme.body(13.5))
                    .foregroundStyle(AppTheme.ink)
                    .lineSpacing(2)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.androidSoft)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .strokeBorder(AppTheme.androidTint.opacity(0.2), lineWidth: 1)
            )
        }
    }

    // MARK: - Footer

    private func footerLayer(_ viewModel: LearningCardViewModel) -> some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(AppTheme.hairline.opacity(0.7))
                .frame(height: 1)

            HStack(spacing: 12) {
                Toggle(isOn: Binding(
                    get: { viewModel.isReadComplete },
                    set: { viewModel.isReadComplete = $0 }
                )) {
                    Text(L10n.tr("card.check.read"))
                        .font(AppTheme.body(12, weight: .medium))
                }
                Toggle(isOn: Binding(
                    get: { viewModel.isPracticeComplete },
                    set: { viewModel.isPracticeComplete = $0 }
                )) {
                    Text(L10n.tr("card.check.practice"))
                        .font(AppTheme.body(12, weight: .medium))
                }

                Spacer(minLength: 8)

                Button(action: viewModel.advance) {
                    Text(viewModel.nextButtonTitle)
                        .font(AppTheme.body(13, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            LinearGradient(
                                colors: [AppTheme.androidTint, AppTheme.accent],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                .buttonStyle(.plain)
                .keyboardShortcut(.defaultAction)
            }
            .toggleStyle(.checkbox)
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(AppTheme.surface)
        }
    }

    // MARK: - Shared

    private func layeredSection<Content: View>(
        title: String,
        accent: Color,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            sectionLabel(title, color: accent)
            content()
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .strokeBorder(AppTheme.hairline, lineWidth: 1)
                )
                .overlay(alignment: .leading) {
                    UnevenRoundedRectangle(
                        topLeadingRadius: 8,
                        bottomLeadingRadius: 8,
                        bottomTrailingRadius: 0,
                        topTrailingRadius: 0,
                        style: .continuous
                    )
                    .fill(accent)
                    .frame(width: 3)
                }
        }
    }

    private func sectionLabel(_ title: String, color: Color = AppTheme.accent) -> some View {
        HStack(spacing: 5) {
            RoundedRectangle(cornerRadius: 1, style: .continuous)
                .fill(color)
                .frame(width: 2.5, height: 10)
            Text(title.uppercased())
                .font(AppTheme.label(9, weight: .bold))
                .foregroundStyle(AppTheme.inkMuted)
                .tracking(0.6)
        }
    }
}
