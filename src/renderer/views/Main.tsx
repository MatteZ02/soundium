import { useState, useEffect, useRef } from 'react';
import Input from '../components/Input';
import Streamer from '../../core/Streamer';
import Track from '../../core/classes/Track';
import TrackElement from '../components/Track';
import Player from '../../core/Player';

export default function Main() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);
  const [midiDevices, setMidiDevices] = useState<MIDIOutput[]>([]);

  const streamerRef = useRef<Streamer | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(setMediaDevices)
      .catch(console.error);
  }, []);

  useEffect(() => {
    function onMIDISuccess(midiAccess) {
      if (!midiAccess.outputs.size)
        console.error('No MIDI output devices available.');
      if (midiDevices !== Array.from(midiAccess.outputs.values()))
        setMidiDevices(Array.from(midiAccess.outputs.values()));
    }

    function onMIDIFailure(msg) {
      console.error(`Failed to get MIDI access - ${msg}`);
    }

    navigator
      .requestMIDIAccess({ sysex: true })
      .then(onMIDISuccess, onMIDIFailure)
      .catch(console.error);
  }, [midiDevices]);

  const audioInputDevices = mediaDevices.filter(
    (device) => device.kind === 'audioinput',
  );
  const audioOutputDevices = mediaDevices.filter(
    (device) => device.kind === 'audiooutput',
  );

  useEffect(() => {
    if (!streamerRef.current) {
      streamerRef.current = new Streamer(audioInputDevices, audioOutputDevices);
    } else {
      streamerRef.current.inputAudioDevices = audioInputDevices;
      streamerRef.current.outputAudioDevices = audioOutputDevices;
    }
  }, [audioInputDevices, audioOutputDevices]);

  useEffect(() => {
    if (!playerRef.current && streamerRef.current) {
      playerRef.current = new Player(streamerRef.current, midiDevices);
    }
  }, [midiDevices]);

  const addTrack = () => {
    const file = document.getElementById('file') as HTMLInputElement;
    if (
      !file.files ||
      file.files.length === 0 ||
      !file.files[0].type.startsWith('audio')
    )
      return;
    const track = new Track(file.files[0]);
    setTracks([...tracks, track]);
    playerRef.current?.addTrack(track);
  };

  const changeMidiOutput = (event) => {
    console.log(event.target.selectedOptions);

    const selected = Array.from(
      event.target.selectedOptions,
    ) as HTMLOptionElement[];
    const selectedDevices = selected.map((option) =>
      midiDevices.find((device) => device.id === option.value),
    );
    playerRef.current?.setMidiOutputs(selectedDevices);
  };

  return (
    <div>
      <div className="controls">
        <div id="timecode">
          <span id="current-time">00:00:00:00</span>
        </div>
        <select
          name="midi-devices"
          id="midi-devices"
          onChange={changeMidiOutput}
          multiple
        >
          {midiDevices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
        <button
          id="play"
          type="button"
          onClick={() => playerRef.current?.play(tracks)}
        >
          Play
        </button>
        <button
          id="stop"
          type="button"
          onClick={() => playerRef.current?.stop()}
        >
          Stop
        </button>
      </div>
      <div className="inputs">
        {audioInputDevices.map((device) => (
          <Input
            key={device.deviceId}
            device={device}
            streamer={streamerRef.current!}
          />
        ))}
      </div>
      <div className="tracks">
        {tracks.map((track) => (
          <TrackElement
            key={track.name}
            track={track}
            tracks={tracks}
            setTracks={setTracks}
            outputDevices={audioOutputDevices}
          />
        ))}
        <div id="add-track">
          <input type="file" id="file" />
          <button id="add-track-button" onClick={addTrack} type="button">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
