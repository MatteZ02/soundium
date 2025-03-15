class StreamManager {
  private streams: HTMLAudioElement[] = [];

  private onendedCallback: () => void = () => {};

  public add(stream: HTMLAudioElement): void {
    this.streams.push(stream);
    stream.addEventListener('ended', () => {
      this.remove(stream);
      if (this.streams.length === 0) {
        this.onendedCallback();
      }
    });
  }

  private remove(stream: HTMLAudioElement): void {
    this.streams = this.streams.filter((s) => s !== stream);
  }

  public play(): void {
    this.streams.forEach((stream) => stream.play());
  }

  public pause(): void {
    this.streams.forEach((stream) => stream.pause());
  }

  public onended(callback: () => void): void {
    this.onendedCallback = callback;
  }

  get currentTime(): number {
    return this.streams[0].currentTime;
  }
}

export default StreamManager;
