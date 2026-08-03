const STATS = [
  { value: '200+',  label: 'Students Enrolled' },
  { value: '12+',   label: 'Years Experience' },
  { value: '98%',   label: 'Completion Rate' },
  { value: '4.9★',  label: 'Average Rating' },
];

export default function LandingStats() {
  return (
    <div className="bg-primary-600 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="font-display font-extrabold text-3xl text-white">{value}</p>
            <p className="text-primary-200 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
