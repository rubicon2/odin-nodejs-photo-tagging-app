import Modal from '../Modal';
import UnstyledList from '../../styled/UnstyledList';

interface Props {
  isActive: boolean;
  tags: Array<Tag>;
  onTagClick: (tagId: React.Key) => any;
  onClose?: () => any;
}

export default function ViewTagListModal({
  isActive,
  tags = [],
  onTagClick = () => {},
  onClose = () => {},
}: Props) {
  return (
    <Modal isActive={isActive} onClose={onClose}>
      Who is it?
      <UnstyledList>
        {tags.map((tag: Tag) => {
          return (
            <li
              key={tag.id}
              onClick={() => {
                onTagClick(tag.id);
              }}
            >
              {tag.name}
            </li>
          );
        })}
      </UnstyledList>
    </Modal>
  );
}
