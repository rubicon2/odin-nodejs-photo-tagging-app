import ModalTransparent from '../ModalTransparent';
import TimesTable from '../TimesTable';
import ViewWinTimeForm from './ViewWinTimeForm';
import { ModalContent, ModalHeaderCentered } from '../../styled/Modal';
import roundToDigits from '../../ext/roundToDigits';
import * as api from '../../ext/api';

import { useState, useLayoutEffect } from 'react';
import styled from 'styled-components';

const CenteredDiv = styled.div`
  text-align: center;
`;

interface Props {
  isActive: boolean;
  timeMs: number;
  onButtonClick?: () => any;
  onClose?: () => any;
}

export default function ViewWinModal({
  isActive,
  timeMs,
  onButtonClick = () => {},
  onClose = () => {},
}: Props) {
  const [bestTimes, setBestTimes] = useState<Array<Time>>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const time2DP = roundToDigits(timeMs / 1000, 2);

  // Update times every time the modal is set to active.
  useLayoutEffect(() => {
    async function fetchData() {
      try {
        const response = await api.fetchBestPhotoTimes();
        const json = await response?.json();
        if (response.ok) {
          const updatedTimes: Array<Time> = [
            ...json.data.bestTimes,
            { name: 'new', timeMs },
          ]
            // Order from shortest to longest time.
            .sort((a, b) => a.timeMs - b.timeMs)
            // Remove the 11th, slowest time.
            .filter((_time, index) => index < 10);
          setBestTimes(updatedTimes);
        }
      } catch (error: any) {
        setMsg(error.message);
      }
    }

    // Clear out any previous messages.
    setMsg(null);
    if (isActive) fetchData();
  }, [isActive]);

  return (
    <ModalTransparent isActive={isActive} onClose={onClose}>
      <ModalContent>
        <ModalHeaderCentered>You Won!</ModalHeaderCentered>
        <CenteredDiv>You took {time2DP} seconds.</CenteredDiv>
        <ModalHeaderCentered as="h3">Best Times</ModalHeaderCentered>
        <TimesTable times={bestTimes} />
        <ViewWinTimeForm onFormSubmit={onButtonClick} />
        {msg && <span>{msg}</span>}
      </ModalContent>
    </ModalTransparent>
  );
}
