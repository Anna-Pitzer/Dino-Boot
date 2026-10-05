export const AUDIO_STORAGE_KEYS = {
  sfxEnabled: 'dinoboot_audio_sfx',
  musicEnabled: 'dinoboot_audio_music',
  sfxVolume: 'dinoboot_sfx_volume',
  musicVolume: 'dinoboot_music_volume',
}

export const DEFAULT_AUDIO_PREFERENCES = {
  sfxEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.6,
}

export const GAME_SOUNDS = {
  button: 'ui/button_soft',
  select: 'ui/item_select',
  confirm: 'ui/submit',
  back: 'ui/pop_close',
  collect: 'arcade/coin',
  correct: 'ui/success_bling',
  wrong: 'notification/error',
  damage: 'arcade/level_down',
  coin: 'arcade/coin_bling',
  levelUp: 'arcade/level_up',
  puzzleStart: 'ui/popup_open',
  puzzleComplete: 'notification/completed',
  boot: 'system/boot_up',
  victory: 'arcade/level_up',
  gameOver: 'arcade/power_down',
  shop: 'ui/popup_open',
  purchase: 'arcade/coin',
  equip: 'system/device_connect',
}
