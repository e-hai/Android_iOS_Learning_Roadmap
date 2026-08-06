import SwiftUI

/// 驾驶舱首页：品牌说明、速查表、练习节奏与开始按钮。
struct HomeView: View {
    @Binding var selection: SidebarSelection?
    @Environment(AppViewModel.self) private var app
    @State private var appeared = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 36) {
                header
                howToUse
                cheatSheet
                weeks
                startButton
            }
            .padding(36)
            .frame(maxWidth: 860, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .leading)
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 10)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AtmosphereBackground())
        .navigationTitle(L10n.tr("home.title"))
        .onAppear {
            withAnimation(.easeOut(duration: 0.45)) {
                appeared = true
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                Text("ANDROID")
                    .font(AppTheme.label(10, weight: .bold))
                    .foregroundStyle(AppTheme.androidTint)
                Image(systemName: "arrow.right")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(AppTheme.inkMuted)
                Text("iOS")
                    .font(AppTheme.label(10, weight: .bold))
                    .foregroundStyle(AppTheme.iosTint)
            }
            .tracking(1.2)

            Text(L10n.tr("home.brand"))
                .font(AppTheme.display(36))
                .foregroundStyle(AppTheme.ink)

            Text(L10n.tr("home.subtitle"))
                .font(AppTheme.body(15))
                .foregroundStyle(AppTheme.inkMuted)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: 520, alignment: .leading)

            ProgressBadge(
                completed: app.progress.mainPathCompletedCount(from: app.roadmap.stages),
                total: app.progress.mainPathTotal(from: app.roadmap.stages)
            )
            .padding(.top, 6)
            .frame(maxWidth: 280)
        }
    }

    private var howToUse: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: L10n.tr("home.how"))
            VStack(alignment: .leading, spacing: 10) {
                guideRow(index: "01", text: L10n.tr("home.guide.01"))
                guideRow(index: "02", text: L10n.tr("home.guide.02"))
                guideRow(index: "03", text: L10n.tr("home.guide.03"))
            }
        }
    }

    private var cheatSheet: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: L10n.tr("home.cheatsheet"))
            Text(L10n.tr("home.cheatsheet.hint"))
                .font(AppTheme.body(13))
                .foregroundStyle(AppTheme.inkMuted)
            ComparisonTableView(
                rows: app.roadmap.cheatSheet,
                androidHeader: L10n.tr("home.cheatsheet.android"),
                iosHeader: L10n.tr("home.cheatsheet.ios")
            )
        }
    }

    private var weeks: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: L10n.tr("home.pace"), accent: AppTheme.iosTint)
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(app.roadmap.practiceWeeks.enumerated()), id: \.offset) { index, week in
                    HStack(alignment: .top, spacing: 14) {
                        Text(String(format: "%02d", index + 1))
                            .font(AppTheme.mono(12, weight: .bold))
                            .foregroundStyle(AppTheme.accent)
                            .frame(width: 28, alignment: .leading)
                        Text(week)
                            .font(AppTheme.body(13.5))
                            .foregroundStyle(AppTheme.ink)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.vertical, 10)
                    if index < app.roadmap.practiceWeeks.count - 1 {
                        Rectangle()
                            .fill(AppTheme.hairline.opacity(0.7))
                            .frame(height: 1)
                    }
                }
            }
        }
    }

    private var startButton: some View {
        Button {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                selection = .stage(app.roadmap.mainPathStages[0].id)
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "play.fill")
                    .font(.system(size: 12, weight: .bold))
                Text(L10n.tr("home.start"))
                    .font(AppTheme.body(14, weight: .semibold))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 18)
            .padding(.vertical, 11)
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
        .padding(.top, 4)
    }

    private func guideRow(index: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text(index)
                .font(AppTheme.mono(11, weight: .bold))
                .foregroundStyle(AppTheme.accent)
                .padding(.top, 2)
            Text(text)
                .font(AppTheme.body(13.5))
                .foregroundStyle(AppTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
