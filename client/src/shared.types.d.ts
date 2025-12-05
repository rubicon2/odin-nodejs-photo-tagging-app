type Photo = {
  readonly id: React.Key;
  readonly altText: string;
  readonly url: string;
};

interface UserPhoto extends Photo {
  readonly tagCount: number;
  readonly tags: Array<UserTag>;
}

interface AdminPhoto extends Photo {
  readonly tags: Array<Tag>;
}

// This is horrible, 3 different types of tags?
type UserTag = {
  readonly id: React.Key;
  readonly name: string;
};

type Tag = {
  readonly id: React.Key;
  readonly name: string;
  readonly posX: number;
  readonly posY: number;
  readonly imageId: string;
};

type EditableTag = {
  id?: React.Key;
  posX: number;
  posY: number;
  name: string;
};

type Pos = {
  x: number;
  y: number;
};
