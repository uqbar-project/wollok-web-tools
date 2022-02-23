// import 'p5'
// import 'p5/lib/addons/p5.sound'
// import { SoundFile } from 'p5'
import { Id } from 'wollok-ts'

interface SoundFile {
  /**
   *   SoundFile object with a path to a file. The
   *   p5.SoundFile may not be available immediately
   *   because it loads the file information
   *   asynchronously.
   *
   *   To do something with the sound as soon as it loads
   *   pass the name of a function as the second
   *   parameter.
   *
   *   Only one file path is required. However, audio
   *   file formats (i.e. mp3, ogg, wav and m4a/aac) are
   *   not supported by all web browsers. If you want to
   *   ensure compatability, instead of a single file
   *   path, you may include an Array of filepaths, and
   *   the browser will choose a format that works.
   *
   *   @param path path to a sound file (String).
   *   Optionally, you may include multiple file formats
   *   in an array. Alternately, accepts an object from
   *   the HTML5 File API, or a p5.File.
   *   @param [successCallback] Name of a function to
   *   call once file loads
   *   @param [errorCallback] Name of a function to call
   *   if file fails to load. This function will receive
   *   an error or XMLHttpRequest object with information
   *   about what went wrong.
   *   @param [whileLoadingCallback] Name of a function
   *   to call while file is loading. That function will
   *   receive progress of the request to load the sound
   *   file (between 0 and 1) as its first parameter.
   *   This progress does not account for the additional
   *   time needed to decode the audio data.
   */
  constructor(
      path: string | any[],
      successCallback?: (...args: any[]) => any,
      errorCallback?: (...args: any[]) => any,
      whileLoadingCallback?: (...args: any[]) => any
  );

  /**
   *   Returns true if the sound file finished loading
   *   successfully.
   */
  isLoaded(): boolean;

  /**
   *   Play the p5.SoundFile
   *   @param [startTime] (optional) schedule playback to
   *   start (in seconds from now).
   *   @param [rate] (optional) playback rate
   *   @param [amp] (optional) amplitude (volume) of
   *   playback
   *   @param [cueStart] (optional) cue start time in
   *   seconds
   *   @param [duration] (optional) duration of playback
   *   in seconds
   */
  play(startTime?: number, rate?: number, amp?: number, cueStart?: number, duration?: number): void;

  /**
   *   p5.SoundFile has two play modes: restart and
   *   sustain. Play Mode determines what happens to a
   *   p5.SoundFile if it is triggered while in the
   *   middle of playback. In sustain mode, playback will
   *   continue simultaneous to the new playback. In
   *   restart mode, play() will stop playback and start
   *   over. With untilDone, a sound will play only if
   *   it's not already playing. Sustain is the default
   *   mode.
   *   @param str 'restart' or 'sustain' or 'untilDone'
   */
  playMode(str: string): void;

  /**
   *   Pauses a file that is currently playing. If the
   *   file is not playing, then nothing will happen.
   *   After pausing, .play() will resume from the paused
   *   position. If p5.SoundFile had been set to loop
   *   before it was paused, it will continue to loop
   *   after it is unpaused with .play().
   *   @param [startTime] (optional) schedule event to
   *   occur seconds from now
   */
  pause(startTime?: number): void;

  /**
   *   Loop the p5.SoundFile. Accepts optional parameters
   *   to set the playback rate, playback volume,
   *   loopStart, loopEnd.
   *   @param [startTime] (optional) schedule event to
   *   occur seconds from now
   *   @param [rate] (optional) playback rate
   *   @param [amp] (optional) playback volume
   *   @param [cueLoopStart] (optional) startTime in
   *   seconds
   *   @param [duration] (optional) loop duration in
   *   seconds
   */
  loop(startTime?: number, rate?: number, amp?: number, cueLoopStart?: number, duration?: number): void;

  /**
   *   Set a p5.SoundFile's looping flag to true or
   *   false. If the sound is currently playing, this
   *   change will take effect when it reaches the end of
   *   the current playback.
   *   @param Boolean set looping to true or false
   */
  setLoop(Boolean: boolean): void;

  /**
   *   Returns 'true' if a p5.SoundFile is currently
   *   looping and playing, 'false' if not.
   */
  isLooping(): boolean;

  /**
   *   Returns true if a p5.SoundFile is playing, false
   *   if not (i.e. paused or stopped).
   */
  isPlaying(): boolean;

  /**
   *   Returns true if a p5.SoundFile is paused, false if
   *   not (i.e. playing or stopped).
   */
  isPaused(): boolean;

  /**
   *   Stop soundfile playback.
   *   @param [startTime] (optional) schedule event to
   *   occur in seconds from now
   */
  stop(startTime?: number): void;

  /**
   *   Set the stereo panning of a p5.sound object to a
   *   floating point number between -1.0 (left) and 1.0
   *   (right). Default is 0.0 (center).
   *   @param [panValue] Set the stereo panner
   *   @param [timeFromNow] schedule this event to happen
   *   seconds from now
   */
  pan(panValue?: number, timeFromNow?: number): void;

  /**
   *   Returns the current stereo pan position (-1.0 to
   *   1.0)
   *   @return Returns the stereo pan setting of the
   *   Oscillator as a number between -1.0 (left) and 1.0
   *   (right). 0.0 is center and default.
   */
  getPan(): number;

  /**
   *   Set the playback rate of a sound file. Will change
   *   the speed and the pitch. Values less than zero
   *   will reverse the audio buffer.
   *   @param [playbackRate] Set the playback rate. 1.0
   *   is normal, .5 is half-speed, 2.0 is twice as fast.
   *   Values less than zero play backwards.
   */
  rate(playbackRate?: number): void;

  /**
   *   Multiply the output volume (amplitude) of a sound
   *   file between 0.0 (silence) and 1.0 (full volume).
   *   1.0 is the maximum amplitude of a digital sound,
   *   so multiplying by greater than 1.0 may cause
   *   digital distortion. To fade, provide a rampTime
   *   parameter. For more complex fades, see the
   *   Envelope class. Alternately, you can pass in a
   *   signal source such as an oscillator to modulate
   *   the amplitude with an audio signal.
   *   @param volume Volume (amplitude) between 0.0 and
   *   1.0 or modulating signal/oscillator
   *   @param [rampTime] Fade for t seconds
   *   @param [timeFromNow] Schedule this event to happen
   *   at t seconds in the future
   */
  setVolume(volume: number | object, rampTime?: number, timeFromNow?: number): void;

  /**
   *   Returns the duration of a sound file in seconds.
   *   @return The duration of the soundFile in seconds.
   */
  duration(): number;

  /**
   *   Return the current position of the p5.SoundFile
   *   playhead, in seconds. Time is relative to the
   *   normal buffer direction, so if reverseBuffer has
   *   been called, currentTime will count backwards.
   *   @return currentTime of the soundFile in seconds.
   */
  currentTime(): number;

  /**
   *   Move the playhead of a soundfile that is currently
   *   playing to a new position and a new duration, in
   *   seconds. If none are given, will reset the file to
   *   play entire duration from start to finish. To set
   *   the position of a soundfile that is not currently
   *   playing, use the play or loop methods.
   *   @param cueTime cueTime of the soundFile in
   *   seconds.
   *   @param duration duration in seconds.
   */
  jump(cueTime: number, duration: number): void;

  /**
   *   Return the number of channels in a sound file. For
   *   example, Mono = 1, Stereo = 2.
   *   @return [channels]
   */
  channels(): number;

  /**
   *   Return the sample rate of the sound file.
   *   @return [sampleRate]
   */
  sampleRate(): number;

  /**
   *   Return the number of samples in a sound file.
   *   Equal to sampleRate * duration.
   *   @return [sampleCount]
   */
  frames(): number;

  /**
   *   Returns an array of amplitude peaks in a
   *   p5.SoundFile that can be used to draw a static
   *   waveform. Scans through the p5.SoundFile's audio
   *   buffer to find the greatest amplitudes. Accepts
   *   one parameter, 'length', which determines size of
   *   the array. Larger arrays result in more precise
   *   waveform visualizations. Inspired by
   *   Wavesurfer.js.
   *   @param [length] length is the size of the returned
   *   array. Larger length results in more precision.
   *   Defaults to 5*width of the browser window.
   *   @return Array of peaks.
   */
  getPeaks(length?: number): Float32Array;

  /**
   *   Reverses the p5.SoundFile's buffer source.
   *   Playback must be handled separately (see example).
   */
  reverseBuffer(): void;

  /**
   *   Schedule an event to be called when the soundfile
   *   reaches the end of a buffer. If the soundfile is
   *   playing through once, this will be called when it
   *   ends. If it is looping, it will be called when
   *   stop is called.
   *   @param callback function to call when the
   *   soundfile has ended.
   */
  onended(callback: (...args: any[]) => any): void;

  /**
   *   Connects the output of a p5sound object to input
   *   of another p5.sound object. For example, you may
   *   connect a p5.SoundFile to an FFT or an Effect. If
   *   no parameter is given, it will connect to the main
   *   output. Most p5sound objects connect to the master
   *   output when they are created.
   *   @param [object] Audio object that accepts an input
   */
  connect(object?: object): void;

  /**
   *   Disconnects the output of this p5sound object.
   */
  disconnect(): void;

  /**
   *   Reset the source for this SoundFile to a new path
   *   (URL).
   *   @param path path to audio file
   *   @param callback Callback
   */
  setPath(path: string, callback: (...args: any[]) => any): void;

  /**
   *   Replace the current Audio Buffer with a new
   *   Buffer.
   *   @param buf Array of Float32 Array(s). 2 Float32
   *   Arrays will create a stereo source. 1 will create
   *   a mono source.
   */
  setBuffer(buf: any[]): void;

  /**
   *   Schedule events to trigger every time a
   *   MediaElement (audio/video) reaches a playback cue
   *   point. Accepts a callback function, a time (in
   *   seconds) at which to trigger the callback, and an
   *   optional parameter for the callback.
   *
   *   Time will be passed as the first parameter to the
   *   callback function, and param will be the second
   *   parameter.
   *   @param time Time in seconds, relative to this
   *   media element's playback. For example, to trigger
   *   an event every time playback reaches two seconds,
   *   pass in the number 2. This will be passed as the
   *   first parameter to the callback function.
   *   @param callback Name of a function that will be
   *   called at the given time. The callback will
   *   receive time and (optionally) param as its two
   *   parameters.
   *   @param [value] An object to be passed as the
   *   second parameter to the callback function.
   *   @return id ID of this cue, useful for
   *   removeCue(id)
   */
  addCue(time: number, callback: (...args: any[]) => any, value?: object): number;

  /**
   *   Remove a callback based on its ID. The ID is
   *   returned by the addCue method.
   *   @param id ID of the cue, as returned by addCue
   */
  removeCue(id: number): void;

  /**
   *   Remove all of the callbacks that had originally
   *   been scheduled via the addCue method.
   */
  clearCues(): void;

  /**
   *   Save a p5.SoundFile as a .wav file. The browser
   *   will prompt the user to download the file to their
   *   device. To upload a file to a server, see getBlob
   *   @param [fileName] name of the resulting .wav file.
   */
  save(fileName?: string): void;

  /**
   *   This method is useful for sending a SoundFile to a
   *   server. It returns the .wav-encoded audio data as
   *   a "Blob". A Blob is a file-like data object that
   *   can be uploaded to a server with an http request.
   *   We'll use the httpDo options object to send a POST
   *   request with some specific options: we encode the
   *   request as multipart/form-data, and attach the
   *   blob as one of the form values using FormData.
   *   @return A file-like data object
   */
  getBlob(): Blob;
}



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
    // this.soundFile = new SoundFile(soundPath)
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