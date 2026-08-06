import SwiftUI

/// 主线进度徽章（已完成 / 总数 + 进度条）。
struct ProgressBadge: View {
    let completed: Int
    let total: Int

    private var fraction: Double {
        guard total > 0 else { return 0 }
        return Double(completed) / Double(total)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(L10n.tr("progress.main"))
                    .font(AppTheme.label(11))
                    .foregroundStyle(AppTheme.inkMuted)
                Spacer()
                HStack(spacing: 2) {
                    Text("\(completed)")
                        .font(AppTheme.mono(13, weight: .bold))
                        .foregroundStyle(AppTheme.accent)
                    Text("/ \(total)")
                        .font(AppTheme.mono(13, weight: .medium))
                        .foregroundStyle(AppTheme.inkMuted)
                }
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(AppTheme.hairline.opacity(0.55))
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [AppTheme.androidTint, AppTheme.accent],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: max(6, geo.size.width * fraction))
                        .animation(.spring(response: 0.45, dampingFraction: 0.82), value: fraction)
                }
            }
            .frame(height: 6)
        }
    }
}
