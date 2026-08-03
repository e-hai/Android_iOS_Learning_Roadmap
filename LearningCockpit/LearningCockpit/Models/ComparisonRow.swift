import Foundation

struct ComparisonRow: Identifiable, Hashable {
    let id: String
    let android: String
    let ios: String
    let note: String?

    init(android: String, ios: String, note: String? = nil) {
        self.id = "\(android)|\(ios)|\(note ?? "")"
        self.android = android
        self.ios = ios
        self.note = note
    }
}
