import './AchievementBadge.css'

export default function AchievementBadge({ achievement, unlocked = false, newlyUnlocked = false }) {
  if (!achievement) return null

  return (
    <div className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'} ${newlyUnlocked ? 'newly-unlocked' : ''}`}>
      <div className="achievement-icon" style={{ color: achievement.accent }}>{achievement.icon}</div>
      <div className="achievement-body">
        <span className="achievement-name">{achievement.name}</span>
        <span className="achievement-description">{achievement.description}</span>
        {newlyUnlocked && <span className="achievement-new-label">DESBLOQUEADA NESTA PARTIDA</span>}
      </div>
    </div>
  )
}
