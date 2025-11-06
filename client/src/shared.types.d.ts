type Photo = {
  readonly id: React.Key;
  readonly altText: string;
  readonly url: string;
};

interface UserPhoto extends Photo {
  readonly tagCount: number;
}

interface AdminPhoto extends Photo {
  readonly tags: Array<Tag>;
}

type Tag = {
  readonly id: React.Key;
  readonly name: string;
  readonly posX: number;
  readonly posY: number;
  readonly imageId: string;
};

type Pos = {
  x: number;
  y: number;
};
