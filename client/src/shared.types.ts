export type Photo = {
  readonly id: React.Key;
  readonly altText: string;
  readonly url: string;
  readonly tags?: Array<Tag>;
};

export type Tag = {
  readonly id: React.Key;
  readonly name: string;
  readonly posX: Number;
  readonly posY: Number;
  readonly imageId: string;
};
