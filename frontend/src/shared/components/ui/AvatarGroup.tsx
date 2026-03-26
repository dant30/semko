import { Avatar } from "./Avatar";

interface AvatarGroupProps {
  names: string[];
}

export function AvatarGroup({ names }: AvatarGroupProps) {
  return (
    <div className="ui-avatar-group">
      {names.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  );
}
