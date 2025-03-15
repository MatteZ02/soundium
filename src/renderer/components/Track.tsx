import React from 'react';
import Track from '../../core/classes/Track';
import Select from './Select';

function TrackElement(props: {
  track: Track;
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  outputDevices: MediaDeviceInfo[];
}) {
  const { track, tracks, setTracks, outputDevices } = props;
  const onChange = (selected: MediaDeviceInfo[]) => {
    track.setOutputDevices(selected);
  };

  const remove = () => {
    setTracks(tracks.filter((t) => t.name !== track.name));
  };

  return (
    <div className="track" key={track.name}>
      <span>{track.name}</span>
      <Select options={outputDevices} onChange={onChange} />
      <button type="button" onClick={remove}>
        remove
      </button>
    </div>
  );
}

export default TrackElement;
