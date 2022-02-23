import 'p5'
import 'p5/lib/addons/p5.sound'
import { SoundFile } from 'p5'
import { Id } from 'wollok-ts'

export type SoundStatus = 'played' | 'paused' | 'stopped'
export interface SoundState {
  id: Id;
  file: string;
  status: SoundStatus;
  volume: number;
  loop: boolean;
}

export class GameSound {
  private lastSoundState: SoundState
  private soundFile: SoundFile
  private started: boolean
  public toBePlayed: boolean

  constructor(lastSoundState: SoundState, soundPath: string) {
    this.lastSoundState = lastSoundState
    this.soundFile = new SoundFile(soundPath)
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