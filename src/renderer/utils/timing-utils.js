const parseTimeToMilliseconds = (timeString) => {
  const timeParts = timeString.split(/[:.]/);
  if (timeParts.length < 4) {
    throw new Error(`Invalid time format: ${timeString}`);
  }

  const hours = Number(timeParts[0]) || 0;
  const minutes = Number(timeParts[1]) || 0;
  const seconds = Number(timeParts[2]) || 0;
  const microseconds = Number(timeParts[3].padEnd(6, '0').slice(0, 6)) || 0;

  const milliseconds = hours * 3600000 + minutes * 60000 + seconds * 1000 + Math.round(microseconds / 1000);

  return milliseconds;
};

const calculateTimeDifference = (startTime, endTime) => {
  try {
    const startMilliseconds = parseTimeToMilliseconds(startTime);
    const endMilliseconds = parseTimeToMilliseconds(endTime);

    const timeDifference = endMilliseconds - startMilliseconds;

    if (timeDifference < 0) {
      console.warn('End time is earlier than start time');
    }
    return timeDifference;
  } catch (error) {
    console.error('Error calculating time difference:', error.message);
    return null;
  }
};

const formatTimeDifference = (timeDifference) => {
  const hours = Math.floor(timeDifference / 3600000);
  const hoursString = hours.toString().padStart(2, '0') + ':';
  const minutes = Math.floor((timeDifference % 3600000) / 60000);
  const minutesString = minutes.toString().padStart(2, '0') + ':';
  const seconds = Math.floor((timeDifference % 60000) / 1000);
  const secondsString = seconds.toString().padStart(2, '0') + '.';
  const milliseconds = timeDifference % 1000;
  const millisecondsString = milliseconds.toString().padStart(3, '0');

  return [hoursString, minutesString, secondsString, millisecondsString].join('');
};

export { parseTimeToMilliseconds, calculateTimeDifference, formatTimeDifference };
