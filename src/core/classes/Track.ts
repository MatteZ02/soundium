export default class Track {
  public readonly outputDevices: MediaDeviceInfo[] = [];

  public readonly name: string;

  constructor(public readonly file: File) {
    this.name = file.name;
  }

  public setOutputDevices(outputDevices: MediaDeviceInfo[]) {
    this.outputDevices.splice(0, this.outputDevices.length, ...outputDevices);
  }
}
