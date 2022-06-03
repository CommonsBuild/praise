import React from 'react';

type useOutsideAlerterReturn = {
  timestamp: number;
  reset: () => void;
};

// eslint-disable-next-line
export const useOutsideAlerter = (ref: any): useOutsideAlerterReturn => {
  const [timestamp, setTimestamp] = React.useState<number>(0);

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target)) {
        setTimestamp(event.timeStamp);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const reset = (): void => {
    setTimestamp(0);
  };
  return { timestamp, reset };
};

export const classNames = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const shortenEthAddress = (address: string): string | null => {
  if (!address || !address.length) return null;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};
