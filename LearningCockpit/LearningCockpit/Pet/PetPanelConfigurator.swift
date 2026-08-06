import AppKit
import SwiftUI

/// 宠物窗：无边框透明浮动面板，只显示角色本身（无系统阴影框）。
struct PetPanelConfigurator: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView(frame: .zero)
        DispatchQueue.main.async {
            Self.apply(to: view.window)
        }
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {
        DispatchQueue.main.async {
            Self.apply(to: nsView.window)
        }
    }

    static func apply(to window: NSWindow?) {
        guard let window else { return }

        // 去掉标题栏 / 缩放边框，只保留内容
        window.styleMask = [.borderless, .fullSizeContentView]
        window.isOpaque = false
        window.backgroundColor = .clear
        // 系统矩形阴影像「画框」；阴影改由宠物素材自己画
        window.hasShadow = false
        window.level = .floating
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.isMovableByWindowBackground = true
        window.collectionBehavior.insert([.canJoinAllSpaces, .fullScreenAuxiliary])
        window.standardWindowButton(.closeButton)?.isHidden = true
        window.standardWindowButton(.miniaturizeButton)?.isHidden = true
        window.standardWindowButton(.zoomButton)?.isHidden = true
        window.invalidateShadow()
    }
}

/// 学习卡窗：不透明面板（外沿不透明）。
struct CardPanelConfigurator: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView(frame: .zero)
        DispatchQueue.main.async {
            Self.apply(to: view.window)
        }
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {
        DispatchQueue.main.async {
            Self.apply(to: nsView.window)
        }
    }

    static func apply(to window: NSWindow?) {
        guard let window else { return }
        window.isOpaque = true
        window.backgroundColor = NSColor(red: 1, green: 1, blue: 1, alpha: 1)
        window.hasShadow = true
        window.level = .floating
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.isMovableByWindowBackground = true
        window.collectionBehavior.insert([.canJoinAllSpaces, .fullScreenAuxiliary])
    }
}
