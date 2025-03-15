import Streamer from '../../core/Streamer';
import Select from './Select';

function Input(props: { device: MediaDeviceInfo; streamer: Streamer }) {
  const { device, streamer } = props;

  const onChange = (selected: MediaDeviceInfo[]) => {
    streamer.routeAudio(device, selected);
  };

  return (
    <div key={device.deviceId} className="input">
      <h6>{device.label}</h6>
      <Select options={streamer.outputAudioDevices} onChange={onChange} />
    </div>
  );
}

export default Input;
