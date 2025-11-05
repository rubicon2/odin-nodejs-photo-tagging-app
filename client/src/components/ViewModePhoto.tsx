import * as api from '../ext/api';
import getElementClickPos from '../ext/getElementClickPos';

interface Props {
  photo: Photo;
  onNoTagsFound?: () => any;
  onTagsFound?: (t: Array<Tag>) => any;
  onMessage?: (s: string) => void;
}

export default function ViewModePhoto({
  photo,
  onNoTagsFound = () => {},
  onTagsFound = () => {},
  onMessage = () => {},
}: Props) {
  async function handleClick(event: React.MouseEvent<HTMLElement>) {
    try {
      const clickPos = getElementClickPos(event);
      const response = await api.postTagCheck(
        photo.id.toString(),
        clickPos.x,
        clickPos.y,
      );
      const json = await response?.json();
      if (response.ok) {
        const tags: Array<Tag> = json.data?.tags;
        if (tags.length > 0) onTagsFound(tags);
        else onNoTagsFound();
      } else {
        if (json.data?.message) {
          onMessage(json.data.message);
        }
      }
    } catch (error: any) {
      console.error(error.message);
      onMessage(error.message);
    }
  }

  return <img src={photo.url} alt={photo.altText} onClick={handleClick} />;
}
