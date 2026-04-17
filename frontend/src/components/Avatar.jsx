const COLORS = [
  '#E91E8C','#9C27B0','#2196F3','#FF5722',
  '#009688','#FF9800','#4CAF50','#F44336','#3F51B5',
];
const initials = (name = '') =>
  name.split(' ').map((x) => x[0]).join('').toUpperCase().slice(0, 2);

// Si tiene foto de avatar la muestra, si no muestra iniciales con color
export default function Avatar({ name = '', src = '', size = 38, fontSize = 14, style = {} }) {
  const color = COLORS[name.length % COLORS.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0, ...style,
        }}
      />
    );
  }

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: color, fontSize, flexShrink: 0, ...style }}
    >
      {initials(name)}
    </div>
  );
}
