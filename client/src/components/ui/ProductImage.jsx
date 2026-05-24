const COLORS = [
  'bg-rose-200 text-rose-800',
  'bg-orange-200 text-orange-800',
  'bg-amber-200 text-amber-800',
  'bg-lime-200 text-lime-800',
  'bg-emerald-200 text-emerald-800',
  'bg-teal-200 text-teal-800',
  'bg-cyan-200 text-cyan-800',
  'bg-sky-200 text-sky-800',
  'bg-blue-200 text-blue-800',
  'bg-violet-200 text-violet-800',
  'bg-purple-200 text-purple-800',
  'bg-fuchsia-200 text-fuchsia-800',
];

function colorFor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export default function ProductImage({ name = '', imageUrl, className = '', textSize = 'text-sm' }) {
  if (!imageUrl) {
    return (
      <div className={`${className} ${colorFor(name)} flex items-center justify-center font-medium text-center px-2 ${textSize}`}>
        {name}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className={className}
      onError={e => {
        e.target.style.display = 'none';
        const div = document.createElement('div');
        div.className = e.target.className + ` ${colorFor(name)} flex items-center justify-center font-medium text-center px-2 ${textSize}`;
        div.textContent = name;
        e.target.parentNode.insertBefore(div, e.target);
      }}
    />
  );
}
