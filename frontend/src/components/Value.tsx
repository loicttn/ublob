type Props = {
  label: string;
  value: string;
};

const Value = ({ label, value }: Props) => {
  return (
    <div className="flex gap-2">
      <label className="text-light-purple">{label}:</label>
      <p className="text-white">{value}</p>
    </div>
  );
};

export default Value;
