import SwiftUI

struct ComparisonTableView: View {
    let rows: [ComparisonRow]
    var androidHeader: String = "Android"
    var iosHeader: String = "iOS"
    var showNote: Bool = true

    private var hasNotes: Bool {
        showNote && rows.contains(where: { $0.note != nil })
    }

    var body: some View {
        VStack(spacing: 0) {
            headerRow
            ForEach(Array(rows.enumerated()), id: \.element.id) { index, row in
                rowView(row, index: index)
            }
        }
        .background(AppTheme.surfaceRaised.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .strokeBorder(AppTheme.hairline.opacity(0.9), lineWidth: 1)
        )
    }

    private var headerRow: some View {
        HStack(alignment: .center, spacing: 0) {
            headerCell(androidHeader, tint: AppTheme.androidTint, soft: AppTheme.androidSoft)
            headerCell(iosHeader, tint: AppTheme.iosTint, soft: AppTheme.iosSoft)
            if hasNotes {
                headerCell("说明", tint: AppTheme.inkMuted, soft: Color.clear)
                    .frame(maxWidth: 168, alignment: .leading)
            }
        }
    }

    private func rowView(_ row: ComparisonRow, index: Int) -> some View {
        HStack(alignment: .top, spacing: 0) {
            cell(row.android, emphasis: AppTheme.androidTint.opacity(0.85))
            cell(row.ios, emphasis: AppTheme.iosTint.opacity(0.85))
            if hasNotes {
                Text(row.note ?? "—")
                    .font(AppTheme.body(12))
                    .foregroundStyle(AppTheme.inkMuted)
                    .textSelection(.enabled)
                    .frame(maxWidth: 168, alignment: .leading)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 11)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .background(index.isMultiple(of: 2) ? AppTheme.ink.opacity(0.025) : Color.clear)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(AppTheme.hairline.opacity(0.7))
                .frame(height: 1)
        }
    }

    private func headerCell(_ text: String, tint: Color, soft: Color) -> some View {
        HStack(spacing: 6) {
            Circle()
                .fill(tint)
                .frame(width: 6, height: 6)
            Text(text)
                .font(AppTheme.label(11, weight: .bold))
                .foregroundStyle(tint)
                .tracking(0.3)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 12)
        .padding(.vertical, 11)
        .background(soft)
    }

    private func cell(_ text: String, emphasis: Color) -> some View {
        Text(text)
            .font(AppTheme.mono(12))
            .foregroundStyle(AppTheme.ink)
            .textSelection(.enabled)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 12)
            .padding(.vertical, 11)
            .fixedSize(horizontal: false, vertical: true)
            .overlay(alignment: .leading) {
                Rectangle()
                    .fill(emphasis.opacity(0.35))
                    .frame(width: 2)
            }
    }
}
