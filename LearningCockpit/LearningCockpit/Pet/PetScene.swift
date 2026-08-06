import SpriteKit
import AppKit

/// SpriteKit 宠物动画引擎：同源整图多帧循环（无叠化，避免透明窗闪烁）。
/// 不属于 ViewModel；由 `PetCharacterView` 托管。
final class PetScene: SKScene {
    var celebrated: Bool = false
    var onMoodChange: ((PetMood) -> Void)?

    private var bodyRoot: SKNode!
    private var cat: SKSpriteNode!
    private var groundShadow: SKShapeNode!
    private var heart: SKLabelNode!

    private var catalog: [String: [SKTexture]] = [:]
    private var currentMood: PetMood = .idle
    private var isBusy = false

    /// 显示宽度上限，保证落在 148×130 宿主内留边。
    private let displayWidth: CGFloat = 96

    private let idleFPS: TimeInterval = 1.0 / 12.0
    private let happyFPS: TimeInterval = 1.0 / 12.0
    private let blinkFPS: TimeInterval = 1.0 / 16.0
    private let sleepFPS: TimeInterval = 1.0 / 10.0
    private let petFPS: TimeInterval = 1.0 / 14.0

    override func didMove(to view: SKView) {
        backgroundColor = .clear
        anchorPoint = CGPoint(x: 0.5, y: 0.5)
        isUserInteractionEnabled = false
        view.allowsTransparency = true
        view.ignoresSiblingOrder = true
        view.preferredFramesPerSecond = 60

        loadCatalog()
        if bodyRoot == nil {
            buildNodes()
        }
        playLoop(.life, fps: idleFPS, pingPong: true)
        startBlinkScheduler()
        startIdleDirector()
    }

    func apply(mood: PetMood) {
        let retrigger = (mood == .petting || mood == .sleepy)
        guard mood != currentMood || retrigger else { return }
        currentMood = mood

        cat.removeAction(forKey: "anim")
        cat.removeAction(forKey: "blinkSched")
        cat.removeAction(forKey: "blinkOnce")
        removeAction(forKey: "moodSequence")
        cat.alpha = 1
        bodyRoot.zRotation = 0
        bodyRoot.setScale(1)

        switch mood {
        case .idle:
            isBusy = false
            playLoop(.life, fps: idleFPS, pingPong: true)
            startBlinkScheduler()
        case .happy:
            isBusy = false
            playLoop(.happy, fps: happyFPS, pingPong: true)
            startBlinkScheduler()
        case .petting:
            playPetting()
        case .sleepy:
            playSleepy()
        }
    }

    // MARK: - 贴图目录

    private enum Clip: String {
        case life, blink, happy, sleep, pet
    }

    private func loadCatalog() {
        let prefixes: [(Clip, String)] = [
            (.life, "CatLife_"),
            (.blink, "CatBlink_"),
            (.happy, "CatHappy_"),
            (.sleep, "CatSleep_"),
            (.pet, "CatPet_"),
        ]
        for (clip, prefix) in prefixes {
            var frames: [SKTexture] = []
            var i = 0
            while i <= 80 {
                let name = String(format: "%@%02d", prefix, i)
                // 缺图时 SKTexture(imageNamed:) 会给出红色 X 占位图，须先用 NSImage 校验。
                guard NSImage(named: name) != nil else { break }
                let tex = SKTexture(imageNamed: name)
                tex.filteringMode = .nearest
                guard tex.size().width > 8 else { break }
                frames.append(tex)
                i += 1
            }
            if !frames.isEmpty {
                catalog[clip.rawValue] = frames
            }
        }
    }

    private func frames(_ clip: Clip) -> [SKTexture] {
        catalog[clip.rawValue] ?? catalog[Clip.life.rawValue] ?? []
    }

    // MARK: - 节点

    private func buildNodes() {
        let shadow = SKShapeNode(ellipseOf: CGSize(width: 58, height: 7))
        shadow.fillColor = NSColor.black.withAlphaComponent(0.12)
        shadow.strokeColor = .clear
        shadow.position = CGPoint(x: 0, y: -48)
        shadow.zPosition = 0
        addChild(shadow)
        groundShadow = shadow

        let root = SKNode()
        root.position = CGPoint(x: 0, y: -2)
        root.zPosition = 1
        addChild(root)
        bodyRoot = root

        let first = frames(.life).first ?? SKTexture()
        let sprite = SKSpriteNode(texture: first)
        fit(sprite)
        sprite.zPosition = 1
        sprite.alpha = 1
        root.addChild(sprite)
        cat = sprite

        // 阴影只做很轻的呼吸，避免整窗跟着「闪」
        let pulse = SKAction.sequence([
            SKAction.fadeAlpha(to: 0.10, duration: 0.9),
            SKAction.fadeAlpha(to: 0.14, duration: 0.9),
        ])
        pulse.timingMode = .easeInEaseOut
        shadow.alpha = 0.12
        shadow.run(SKAction.repeatForever(pulse))

        let heartNode = SKLabelNode(text: "♥")
        heartNode.fontName = "Helvetica-Bold"
        heartNode.fontSize = 16
        heartNode.fontColor = NSColor(red: 1, green: 0.42, blue: 0.45, alpha: 1)
        heartNode.position = CGPoint(x: 44, y: 34)
        heartNode.zPosition = 5
        heartNode.alpha = 0
        heartNode.setScale(0.4)
        addChild(heartNode)
        heart = heartNode
    }

    private func fit(_ node: SKSpriteNode) {
        guard let tex = node.texture else { return }
        let size = tex.size()
        guard size.width > 0 else { return }
        let scale = displayWidth / size.width
        node.size = CGSize(width: size.width * scale, height: size.height * scale)
    }

    private func fittedSize(for tex: SKTexture) -> CGSize {
        let size = tex.size()
        let scale = displayWidth / max(size.width, 1)
        return CGSize(width: size.width * scale, height: size.height * scale)
    }

    // MARK: - 动画核心

    /// 乒乓：正向 + 反向（去掉首尾重复），避免末帧跳回首帧。
    private func pingPong(_ list: [SKTexture]) -> [SKTexture] {
        guard list.count >= 3 else { return list }
        return list + list.dropFirst().dropLast().reversed()
    }

    private func playLoop(_ clip: Clip, fps: TimeInterval, pingPong: Bool) {
        let raw = frames(clip)
        guard !raw.isEmpty else { return }
        let list = pingPong ? self.pingPong(raw) : raw
        cat.removeAction(forKey: "anim")
        cat.alpha = 1
        cat.texture = list[0]
        cat.size = fittedSize(for: list[0])
        let anim = SKAction.animate(with: list, timePerFrame: fps, resize: false, restore: false)
        cat.run(SKAction.repeatForever(anim), withKey: "anim")
    }

    private func playOnce(
        _ clip: Clip,
        fps: TimeInterval,
        key: String = "anim",
        completion: (() -> Void)? = nil
    ) {
        let list = frames(clip)
        guard !list.isEmpty else {
            completion?()
            return
        }
        cat.removeAction(forKey: "anim")
        cat.alpha = 1
        cat.texture = list[0]
        cat.size = fittedSize(for: list[0])
        let anim = SKAction.animate(with: list, timePerFrame: fps, resize: false, restore: false)
        if let completion {
            cat.run(SKAction.sequence([anim, SKAction.run(completion)]), withKey: key)
        } else {
            cat.run(anim, withKey: key)
        }
    }

    // MARK: - 待机眨眼插入

    private func startBlinkScheduler() {
        cat.removeAction(forKey: "blinkSched")
        let wait = SKAction.wait(forDuration: 3.4, withRange: 1.6)
        let blink = SKAction.run { [weak self] in self?.insertBlink() }
        cat.run(SKAction.repeatForever(SKAction.sequence([wait, blink])), withKey: "blinkSched")
    }

    private func insertBlink() {
        guard !isBusy else { return }
        guard currentMood == .idle || currentMood == .happy else { return }

        let resume: Clip = currentMood == .happy ? .happy : .life
        let fps = currentMood == .happy ? happyFPS : idleFPS
        // 直接切眨眼再切回循环，不做 alpha 叠化（透明窗上叠化会闪）。
        playOnce(.blink, fps: blinkFPS, key: "blinkOnce") { [weak self] in
            guard let self else { return }
            guard self.currentMood == .idle || self.currentMood == .happy else { return }
            self.playLoop(resume, fps: fps, pingPong: true)
        }
    }

    private func startIdleDirector() {
        removeAction(forKey: "idleDirector")
        let wait = SKAction.wait(forDuration: 8.0, withRange: 3.0)
        let pick = SKAction.run { [weak self] in
            guard let self, !self.isBusy else { return }
            guard self.currentMood == .idle || self.currentMood == .happy else { return }
            self.onMoodChange?(.sleepy)
        }
        run(SKAction.repeatForever(SKAction.sequence([wait, pick])), withKey: "idleDirector")
    }

    // MARK: - 动作（撸猫 / 睡觉）

    private func playPetting() {
        isBusy = true
        cat.removeAction(forKey: "blinkSched")
        showHeartBurst()
        playOnce(.pet, fps: petFPS) { [weak self] in
            self?.finishShortAction()
        }
    }

    private func playSleepy() {
        isBusy = true
        cat.removeAction(forKey: "blinkSched")
        playOnce(.sleep, fps: sleepFPS) { [weak self] in
            self?.finishShortAction()
        }
    }

    private func finishShortAction() {
        isBusy = false
        cat.alpha = 1
        bodyRoot.zRotation = 0
        let next: PetMood = celebrated ? .happy : .idle
        currentMood = next
        playLoop(next == .happy ? .happy : .life, fps: next == .happy ? happyFPS : idleFPS, pingPong: true)
        startBlinkScheduler()
        onMoodChange?(next)
    }

    private func showHeartBurst() {
        heart.removeAllActions()
        heart.alpha = 0
        heart.setScale(0.4)
        heart.position = CGPoint(x: 44, y: 34)
        let show = SKAction.group([
            SKAction.fadeIn(withDuration: 0.12),
            SKAction.scale(to: 1.15, duration: 0.18),
        ])
        show.timingMode = .easeOut
        heart.run(
            SKAction.sequence([
                show,
                SKAction.moveBy(x: 6, y: 12, duration: 0.55),
                SKAction.group([
                    SKAction.fadeOut(withDuration: 0.22),
                    SKAction.scale(to: 0.7, duration: 0.22),
                ]),
            ])
        )
    }
}
