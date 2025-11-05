type Photo = {
  readonly id: React.Key;
  readonly altText: string;
  readonly url: string;
};

interface UserPhoto extends Photo {
  readonly tagCount: Number;
}

interface AdminPhoto extends Photo {
  readonly tags: Array<Tag>;
}

type Tag = {
  readonly id: React.Key;
  readonly name: string;
  readonly posX: Number;
  readonly posY: Number;
  readonly imageId: string;
};
