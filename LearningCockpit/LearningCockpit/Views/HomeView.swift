import SwiftUI

struct HomeView: View {
    @Binding var selection: SidebarSelection?
    @Environment(ProgressStore.self) private var progressStore
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
        .background(AtmosphereBackground())
        .navigationTitle("Android → iOS")
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

            Text("学习驾驶舱")
                .font(AppTheme.display(36))
                .foregroundStyle(AppTheme.ink)

            Text("从 Kotlin 迁移到 Swift。一次只看一个阶段——对照是核心，进度留在本地。")
                .font(AppTheme.body(15))
                .foregroundStyle(AppTheme.inkMuted)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: 520, alignment: .leading)

            ProgressBadge(
                completed: progressStore.mainPathCompletedCount(from: RoadmapData.stages),
                total: progressStore.mainPathTotal(from: RoadmapData.stages)
            )
            .padding(.top, 6)
            .frame(maxWidth: 280)
        }
    }

    private var howToUse: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "怎么用")
            VStack(alignment: .leading, spacing: 10) {
                guideRow(index: "01", text: "已会 Android：每阶段重点看 iOS 列和「迁移注意」")
                guideRow(index: "02", text: "两端都在学：先 Android 模块，再立刻学 iOS 对应模块")
                guideRow(index: "03", text: "主路径按序学完；进阶可后补")
            }
        }
    }

    private var cheatSheet: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "迁移者速查")
            Text("你会 X，重点学 Y")
                .font(AppTheme.body(13))
                .foregroundStyle(AppTheme.inkMuted)
            ComparisonTableView(
                rows: RoadmapData.cheatSheet,
                androidHeader: "你已掌握",
                iosHeader: "iOS 优先补"
            )
        }
    }

    private var weeks: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "建议实践节奏", accent: AppTheme.iosTint)
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(RoadmapData.practiceWeeks.enumerated()), id: \.offset) { index, week in
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
                    if index < RoadmapData.practiceWeeks.count - 1 {
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
                selection = .stage(RoadmapData.mainPathStages[0].id)
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "play.fill")
                    .font(.system(size: 12, weight: .bold))
                Text("从第 1 阶段开始")
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
