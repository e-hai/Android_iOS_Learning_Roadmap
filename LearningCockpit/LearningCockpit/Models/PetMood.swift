import Foundation

/// 桌面宠物的表情 / 动画状态（驱动 SpriteKit 序列）。
enum PetMood: Equatable {
    /// 待机（含眨眼循环）。
    case idle
    /// 被撸 / 单击反馈。
    case petting
    /// 睡觉。
    case sleepy
    /// 主线完成后的开心态。
    case happy
}
