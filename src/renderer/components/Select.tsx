function Select({
  options,
  onChange,
}: {
  options: MediaDeviceInfo[];
  onChange: (selected: MediaDeviceInfo[]) => void;
}) {
  const onClick = (event) => {
    const option = options.find(
      (device) => device.deviceId === event.target.dataset.deviceId,
    );
    if (!option) return;
    event.target.classList.toggle('selected');
    const selected = Array.from(event.target.parentElement.children)
      .filter((child) => child.classList.contains('selected'))
      .map((child) => {
        const device = options.find(
          (device) => device.deviceId === child.dataset.deviceId,
        );
        if (!device) throw new Error('Device not found.');
        return device;
      });
    onChange(selected);
  };

  return (
    <div className="select">
      {options.map((option) => {
        return (
          <div
            className="option"
            onClick={onClick}
            key={option.deviceId}
            data-device-id={option.deviceId}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
}

export default Select;
