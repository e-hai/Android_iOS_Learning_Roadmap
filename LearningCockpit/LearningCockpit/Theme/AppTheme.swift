import SwiftUI

enum AppTheme {
    // Slate + teal — technical, calm; avoids purple / cream-terracotta defaults
    static let ink = Color(red: 0.12, green: 0.16, blue: 0.20)
    static let inkMuted = Color(red: 0.35, green: 0.40, blue: 0.45)
    static let surface = Color(red: 0.97, green: 0.98, blue: 0.985)
    static let surfaceRaised = Color.white
    static let hairline = Color(red: 0.78, green: 0.82, blue: 0.86)

    static let accent = Color(red: 0.08, green: 0.52, blue: 0.55)       // teal
    static let accentSoft = Color(red: 0.08, green: 0.52, blue: 0.55).opacity(0.10)
    static let androidTint = Color(red: 0.22, green: 0.55, blue: 0.32)  // android green
    static let androidSoft = Color(red: 0.22, green: 0.55, blue: 0.32).opacity(0.08)
    static let iosTint = Color(red: 0.12, green: 0.42, blue: 0.72)      // ios blue
    static let iosSoft = Color(red: 0.12, green: 0.42, blue: 0.72).opacity(0.08)
    static let warn = Color(red: 0.72, green: 0.42, blue: 0.12)
    static let warnSoft = Color(red: 0.72, green: 0.42, blue: 0.12).opacity(0.10)
    static let done = Color(red: 0.18, green: 0.58, blue: 0.40)

    static let pageGradient = LinearGradient(
        colors: [
            Color(red: 0.94, green: 0.96, blue: 0.97),
            Color(red: 0.91, green: 0.95, blue: 0.96),
            Color(red: 0.93, green: 0.94, blue: 0.97),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static func display(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }

    static func body(_ size: CGFloat = 14, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .default)
    }

    static func mono(_ size: CGFloat = 12.5, weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }

    static func label(_ size: CGFloat = 11, weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
}

struct AtmosphereBackground: View {
    var body: some View {
        ZStack {
            AppTheme.pageGradient
            GeometryReader { geo in
                Canvas { context, size in
                    let step: CGFloat = 22
                    for x in stride(from: 0, through: size.width, by: step) {
                        for y in stride(from: 0, through: size.height, by: step) {
                            let rect = CGRect(x: x, y: y, width: 1.2, height: 1.2)
                            context.fill(Path(ellipseIn: rect), with: .color(.black.opacity(0.035)))
                        }
                    }
                }
            }
            // Soft teal wash top-right
            RadialGradient(
                colors: [AppTheme.accent.opacity(0.09), .clear],
                center: .topTrailing,
                startRadius: 20,
                endRadius: 420
            )
            // Soft green wash bottom-left (Android side of the bridge)
            RadialGradient(
                colors: [AppTheme.androidTint.opacity(0.06), .clear],
                center: .bottomLeading,
                startRadius: 10,
                endRadius: 380
            )
        }
        .ignoresSafeArea()
    }
}

struct SectionHeader: View {
    let title: String
    var accent: Color = AppTheme.accent

    var body: some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 1.5, style: .continuous)
                .fill(accent)
                .frame(width: 3, height: 14)
            Text(title)
                .font(AppTheme.label(13, weight: .bold))
                .foregroundStyle(AppTheme.ink)
                .tracking(0.4)
        }
    }
}

struct PlatformChip: View {
    enum Kind { case path, advanced }

    let kind: Kind

    var body: some View {
        Text(kind == .path ? "主路径" : "进阶")
            .font(AppTheme.label(10))
            .foregroundStyle(kind == .path ? AppTheme.accent : AppTheme.warn)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background((kind == .path ? AppTheme.accentSoft : AppTheme.warnSoft))
            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
    }
}
