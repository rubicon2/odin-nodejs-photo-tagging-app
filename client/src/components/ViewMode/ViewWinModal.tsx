import Modal from '../Modal';
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
  time: number;
  onButtonClick?: () => any;
  onClose?: () => any;
}

export default function ViewWinModal({
  isActive,
  time,
  onButtonClick = () => {},
  onClose = () => {},
}: Props) {
  const [bestTimes, setBestTimes] = useState<Array<Time>>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const time2DP = roundToDigits(time, 2);

  // Update times every time the modal is set to active.
  useLayoutEffect(() => {
    // Clear out any previous messages.
    setMsg(null);

    async function fetchData() {
      try {
        const response = await api.fetchBestPhotoTimes();
        const json = await response?.json();
        if (response.ok) {
          const bestTimes = json.data.bestTimes;
          if (bestTimes) setBestTimes(bestTimes);
        }
      } catch (error: any) {
        setMsg(error.message);
      }
    }

    fetchData();
  }, [isActive]);

  return (
    <Modal isActive={isActive} onClose={onClose}>
      <ModalContent>
        <ModalHeaderCentered>You Won!</ModalHeaderCentered>
        <CenteredDiv>You took {time2DP} seconds.</CenteredDiv>
        <ModalHeaderCentered as="h3">Best Times</ModalHeaderCentered>
        <TimesTable times={bestTimes} />
        <ViewWinTimeForm onFormSubmit={onButtonClick} />
        {msg && <span>{msg}</span>}
      </ModalContent>
    </Modal>
  );
}
