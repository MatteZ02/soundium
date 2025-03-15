import Track from './classes/Track';

class Streamer {
  constructor(
    public inputAudioDevices: MediaDeviceInfo[],
    public outputAudioDevices: MediaDeviceInfo[],
  ) {
    console.log('Streamer initialized');
    console.log('Input devices:', inputAudioDevices);
    console.log('Output devices:', outputAudioDevices);
  }

  public async routeAudio(
    inputDevice: MediaDeviceInfo,
    outputDevices: MediaDeviceInfo[],
  ) {
    console.log(
      `Routing audio from ${inputDevice.label} to ${outputDevices
        .map((device) => device.label)
        .join(', ')}`,
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: inputDevice.deviceId },
        },
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      outputDevices.forEach((outputDevice) => {
        const availableOutputDevice = this.outputAudioDevices.find(
          (device) => device.deviceId === outputDevice.deviceId,
        );

        if (availableOutputDevice) {
          source.connect(audioContext.destination);
          audioContext
            .setSinkId(outputDevice.deviceId)
            .then(() => console.log('Output device set'))
            .catch((error) => {
              console.error(
                `Error setting sink ID for output device ${outputDevice.label}:`,
                error,
              );
            });
        } else {
          console.warn(`Output device ${outputDevice.label} not available.`);
        }
      });
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }

  public async stream(track: Track): Promise<HTMLAudioElement> {
    console.log(track);

    const audioContext = new AudioContext();
    const audio = new Audio(URL.createObjectURL(track.file));
    const source = audioContext.createMediaElementSource(audio);

    track.outputDevices.forEach(async (outputDevice) => {
      console.log(`Streaming audio to ${outputDevice.label}`);

      const availableOutputDevice = this.outputAudioDevices.find(
        (device) => device.deviceId === outputDevice.deviceId,
      );

      if (availableOutputDevice) {
        source.connect(audioContext.destination);
        console.log('Output device set to ', outputDevice.deviceId);
        await audioContext.setSinkId(outputDevice.deviceId).catch((error) => {
          console.error(
            `Error setting sink ID for output device ${outputDevice.label}:`,
            error,
          );
        });
      } else {
        console.warn(`Output device ${outputDevice.label} not available.`);
      }
    });

    return audio;
  }
}

export default Streamer;
