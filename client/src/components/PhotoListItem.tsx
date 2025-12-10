import PaddedContainer from '../styled/PaddedContainer';
import FakeLink from '../styled/FakeLink';
import styled from 'styled-components';

const Item = styled.div`
  cursor: pointer;
`;

const SelectedItem = styled(Item)`
  font-weight: bold;
  background-color: #ff7777;
  color: #213547;
`;

interface Props {
  photo: Photo;
  isSelected: boolean;
}

export default function PhotoListItem({ photo, isSelected }: Props) {
  const content = <PaddedContainer>{photo.altText}</PaddedContainer>;
  return (
    <FakeLink>
      {isSelected ? (
        <SelectedItem>{content}</SelectedItem>
      ) : (
        <Item>{content}</Item>
      )}
    </FakeLink>
  );
}
