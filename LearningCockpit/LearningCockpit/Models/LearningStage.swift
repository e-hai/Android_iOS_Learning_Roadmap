import Foundation

/// 单个学习阶段（主线或进阶）的内容实体。
struct LearningStage: Identifiable, Hashable {
    let id: String
    /// 展示用序号（从 1 起）。
    let number: Int
    let title: String
    /// 难度星级展示文案。
    let stars: String
    /// `true` 表示进阶章节，不计入主线进度。
    let isAdvanced: Bool
    let goal: String
    let notes: [String]
    let practice: String
    /// Android ↔ iOS 对照行。
    let rows: [ComparisonRow]
    let extraHint: String?

    /// 侧栏 / 导航标题：`序号. 标题`。
    var displayTitle: String {
        "\(number). \(title)"
    }
}

/// 驾驶舱侧栏选中项。
enum SidebarSelection: Hashable {
    case home
    case stage(String)
}
