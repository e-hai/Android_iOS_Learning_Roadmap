import Foundation

/// 本地化文案读取；key 定义在 `Localizable.xcstrings`。
enum L10n {
    static func tr(_ key: String) -> String {
        String(localized: String.LocalizationValue(key))
    }

    static func tr(_ key: String, _ args: CVarArg...) -> String {
        let format = String(localized: String.LocalizationValue(key))
        return String(format: format, locale: .current, arguments: args)
    }
}
