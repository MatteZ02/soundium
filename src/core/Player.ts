import Track from './classes/Track';
import StreamManager from './managers/StreamManager';
import Streamer from './Streamer';

export default class Player {
  private readonly tracks: Track[] = [];

  private playing = false;

  private paused = false;

  private startTime: null | number = null;

  private pausedSince: null | number = null;

  private pausedTime = 0;

  private timecodeInterval: null | NodeJS.Timeout = null;

  private streams = new StreamManager();

  constructor(
    private readonly streamer: Streamer,
    private readonly midiOutputs: MIDIOutput[],
  ) {
    this.streams.onended(() => {
      this.playing = false;
      this.paused = false;
      this.startTime = null;
      this.pausedSince = null;
      this.pausedTime = 0;
      if (this.timecodeInterval) clearInterval(this.timecodeInterval);
      document.getElementById('current-time')!.textContent = '00:00:00:00';
    });
  }

  public play(tracks: Track[]) {
    console.log(tracks);

    tracks.forEach(async (track) => {
      console.log(track);

      const stream = await this.streamer.stream(track);
      this.streams.add(stream);
      stream.play();
    });
    this.playing = true;
    this.startTime = Date.now();
    this.generateTimecode();
  }

  public stop(): void {
    this.streams?.pause();
    this.playing = false;
    this.paused = false;
    this.startTime = null;
    this.pausedSince = null;
    this.pausedTime = 0;
    if (this.timecodeInterval) clearInterval(this.timecodeInterval);
    document.getElementById('current-time')!.textContent = '00:00:00:00';
  }

  public pause(): void {
    this.streams?.pause();
    this.paused = true;
    this.pausedSince = Date.now();
    if (this.timecodeInterval) clearInterval(this.timecodeInterval);
  }

  public resume(): void {
    this.streams?.play();
    this.paused = false;
    this.pausedTime += Date.now() - (this.pausedSince ?? 0);
    this.pausedSince = null;
    this.generateTimecode(this.pausedTime);
  }

  public addTrack(track: Track): void {
    this.tracks.push(track);
    console.log(this.tracks);
  }

  public get time(): number {
    if (this.paused) return this.pausedTime;
    if (this.startTime) return Date.now() - this.startTime - this.pausedTime;
    return 0;
  }

  public setMidiOutputs(midiOutputs: MIDIOutput[]): void {
    this.midiOutputs.splice(0, this.midiOutputs.length, ...midiOutputs);
  }

  private generateTimecode(startTime = 0) {
    if (this.timecodeInterval) clearInterval(this.timecodeInterval);
    const framerate = 30;
    let frames = startTime * framerate;
    let quarterFrame = 0;

    this.timecodeInterval = setInterval(
      () => {
        const hours = Math.floor(frames / (framerate * 60 * 60));
        const minutes = Math.floor(frames / (framerate * 60)) % 60;
        const seconds = Math.floor(frames / framerate) % 60;
        const frame = frames % framerate;

        const timecode = [
          frame & 0x0f,
          (frame >> 4) & 0x01,
          seconds & 0x0f,
          (seconds >> 4) & 0x07,
          minutes & 0x0f,
          (minutes >> 4) & 0x07,
          hours & 0x0f,
          (hours >> 4) & 0x01,
        ];

        document.getElementById('current-time')!.textContent = `
        ${hours.toString().padStart(2, '0')}:
        ${minutes.toString().padStart(2, '0')}:
        ${seconds.toString().padStart(2, '0')}:
        ${frame.toString().padStart(2, '0')}
        `;

        this.midiOutputs.forEach((output) => {
          const message = [0xf1, (quarterFrame << 4) | timecode[quarterFrame]];
          output.send(message);
        });

        quarterFrame = (quarterFrame + 1) % 8;
        if (quarterFrame === 0) {
          frames += 1;
        }
      },
      1000 / (framerate * 4),
    );
  }
}
