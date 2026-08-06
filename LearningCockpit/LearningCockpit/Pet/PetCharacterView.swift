import SwiftUI
import SpriteKit

/// SpriteKit 像素猫的 SwiftUI 宿主，把 `mood` 同步给 `PetScene`。
struct PetCharacterView: View {
    var celebrated: Bool = false
    @Binding var mood: PetMood

    @State private var scene: PetScene = {
        let scene = PetScene(size: CGSize(width: 148, height: 130))
        scene.scaleMode = .resizeFill
        return scene
    }()

    var body: some View {
        SpriteView(scene: scene, options: [.allowsTransparency])
            .frame(width: 148, height: 130)
            .background(Color.clear)
            .onAppear {
                scene.celebrated = celebrated
                scene.onMoodChange = { next in
                    mood = next
                }
                scene.apply(mood: mood)
            }
            .onChange(of: mood) { _, newMood in
                scene.apply(mood: newMood)
            }
            .onChange(of: celebrated) { _, value in
                scene.celebrated = value
                if value && mood == .idle {
                    mood = .happy
                }
            }
    }
}
