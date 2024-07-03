// import 'p5'
import { SoundFile } from 'p5'
import { SoundState } from './utils'

export class GameSound {
  private lastSoundState: SoundState
  private soundFile: SoundFile
  private started: boolean
  public toBePlayed: boolean

  constructor(lastSoundState: SoundState, soundFile: SoundFile) {
    this.lastSoundState = lastSoundState
    this.soundFile = soundFile
    this.started = false
    this.toBePlayed = false
  }

  public isLoaded(): boolean {
    return this.soundFile.isLoaded()
  }

  public canBePlayed(newSoundState: SoundState): boolean {
    return (this.lastSoundState.status !== newSoundState.status || !this.started) && this.isLoaded()
  }

  public update(newSoundState: SoundState): void {
    this.soundFile.setLoop(newSoundState.loop)
    this.soundFile.setVolume(newSoundState.volume)
    this.toBePlayed = this.canBePlayed(newSoundState)
    this.lastSoundState = newSoundState
  }

  public playSound(): void {
    if (this.toBePlayed) {
      this.started = true

      switch (this.lastSoundState.status) {
        case 'played':
          this.soundFile.play()
          break
        case 'paused':
          this.soundFile.pause()
          break
        case 'stopped':
          this.soundFile.stop()
      }
    }

  }

  public stopSound(): void {
    this.soundFile.stop()
  }
}