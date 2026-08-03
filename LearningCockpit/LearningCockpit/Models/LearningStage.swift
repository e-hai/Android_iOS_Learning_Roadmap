import Foundation

struct LearningStage: Identifiable, Hashable {
    let id: String
    let number: Int
    let title: String
    let stars: String
    let isAdvanced: Bool
    let goal: String
    let notes: [String]
    let practice: String
    let rows: [ComparisonRow]
    let extraHint: String?

    var displayTitle: String {
        "\(number). \(title)"
    }
}

enum SidebarSelection: Hashable {
    case home
    case stage(String)
}
