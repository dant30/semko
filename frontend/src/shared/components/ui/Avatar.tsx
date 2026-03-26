interface AvatarProps {
  name: string;
}

export function Avatar({ name }: AvatarProps) {
  return <span className="ui-avatar">{name.slice(0, 1).toUpperCase()}</span>;
}
